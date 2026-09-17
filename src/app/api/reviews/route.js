// src/app/api/reviews/route.js
// Server-side API handler for customer product reviews and admin moderation

import { NextResponse } from 'next/server';
import { createAdminClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://ie8b79we.ap-southeast.insforge.app';
const apiKey = process.env.INSFORGE_API_KEY || 'ik_39409229b28f7d38e6edbe9761bbdd57';

const adminClient = createAdminClient({
  baseUrl,
  apiKey,
});

/**
 * Helper to mask customer's full name for public privacy (e.g. "Budi Santoso" -> "Budi S.")
 */
function formatPrivacyName(fullName) {
  if (!fullName) return 'Pelanggan';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

/**
 * GET /api/reviews
 * Query parameters:
 * - productId (optional): filter reviews for a specific product
 * - orderId (optional): check reviews submitted for a specific order
 * - all (optional): if 'true', return all reviews including hidden (admin)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const orderId = searchParams.get('orderId');
    const includeHidden = searchParams.get('all') === 'true';

    let query = adminClient.database.from('reviews').select('*');

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    if (!includeHidden) {
      query = query.eq('is_hidden', false);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reviews from InsForge:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reviews: (data || []).map(r => ({
        id: r.id,
        orderId: r.order_id,
        productId: r.product_id,
        rating: Number(r.rating),
        comment: r.comment || '',
        photoUrl: r.photo_url || '',
        photoKey: r.photo_key || '',
        buyerName: r.buyer_name || 'Pelanggan',
        privacyName: formatPrivacyName(r.buyer_name),
        isHidden: Boolean(r.is_hidden),
        createdAt: r.created_at
      }))
    });
  } catch (err) {
    console.error('Exception in GET /api/reviews:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * Body: { reviews: [{ orderId, productId, rating, comment, photoUrl, photoKey, buyerName }] }
 * OR single object: { orderId, productId, rating, comment, photoUrl, photoKey, buyerName }
 */
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawItems = Array.isArray(body.reviews) ? body.reviews : [body];

    if (rawItems.length === 0 || !rawItems[0].orderId) {
      return NextResponse.json(
        { success: false, error: 'Data ulasan tidak valid atau pesanan tidak ditemukan.' },
        { status: 400 }
      );
    }

    const rowsToInsert = [];

    for (const item of rawItems) {
      const { orderId, productId, rating, comment, photoUrl, photoKey, buyerName } = item;

      // 1. Validation
      if (!orderId || !productId) {
        return NextResponse.json(
          { success: false, error: 'Order ID dan Product ID wajib diisi.' },
          { status: 400 }
        );
      }

      const numRating = Number(rating);
      if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
        return NextResponse.json(
          { success: false, error: 'Rating harus berupa angka bulat antara 1 hingga 5 bintang.' },
          { status: 400 }
        );
      }

      const cleanComment = (comment || '').trim().slice(0, 200);

      // 2. Prevent duplicate submission for same order_id + product_id
      const existing = await adminClient.database
        .from('reviews')
        .select('id')
        .eq('order_id', orderId)
        .eq('product_id', productId)
        .limit(1);

      if (existing.data && existing.data.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Produk (${productId}) pada pesanan #${orderId} sudah pernah diberikan ulasan.` 
          },
          { status: 409 }
        );
      }

      const reviewId = `rev-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      rowsToInsert.push({
        id: reviewId,
        order_id: orderId,
        product_id: productId,
        rating: numRating,
        comment: cleanComment || null,
        photo_url: photoUrl || null,
        photo_key: photoKey || null,
        buyer_name: buyerName || 'Pelanggan',
        is_hidden: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // 3. Batch insert into InsForge PostgreSQL
    const { data, error } = await adminClient.database
      .from('reviews')
      .insert(rowsToInsert);

    if (error) {
      console.error('Error inserting review into InsForge:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Ulasan berhasil disimpan. Terima kasih atas masukan Anda!',
      count: rowsToInsert.length
    }, { status: 201 });
  } catch (err) {
    console.error('Exception in POST /api/reviews:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/reviews
 * Moderation by admin: toggle is_hidden
 * Body: { id: string, isHidden: boolean }
 */
export async function PATCH(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, isHidden } = body;

    if (!id || typeof isHidden !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'ID ulasan dan status isHidden wajib disertakan.' },
        { status: 400 }
      );
    }

    const { error } = await adminClient.database
      .from('reviews')
      .update({
        is_hidden: isHidden,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating review moderation status:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Ulasan berhasil ${isHidden ? 'disembunyikan' : 'ditampilkan kembali'}.`
    });
  } catch (err) {
    console.error('Exception in PATCH /api/reviews:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
