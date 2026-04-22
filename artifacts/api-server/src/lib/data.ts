import { db } from "@workspace/db";
import { booksTable, podcastsTable } from "@workspace/db/schema";
import { supabase } from "./supabase";
import { desc } from "drizzle-orm";
import { logger } from "./logger";

export async function fetchBooks() {
  try {
    // Try Drizzle (Primary)
    return await db.select().from(booksTable).orderBy(booksTable.createdAt);
  } catch (err) {
    logger.warn({ err }, "Drizzle fetch failed, falling back to Supabase API");
    // Fallback to Supabase REST API
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    // Map snake_case to camelCase if needed, but the schema seems to use snake_case for everything in the DB
    // actually drizzle schema uses camelCase for the JS objects.
    // I need to map them.
    return data.map(b => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      description: b.description,
      author: b.author,
      coverImage: b.cover_image,
      type: b.type,
      hardcopyPrice: b.hardcopy_price,
      ebookPrice: b.ebook_price,
      currency: b.currency,
      isLatest: b.is_latest,
      publishedYear: b.published_year,
      category: b.category,
      createdAt: new Date(b.created_at)
    }));
  }
}

export async function fetchLatestPodcasts(limit = 3) {
  try {
    return await db
      .select()
      .from(podcastsTable)
      .orderBy(desc(podcastsTable.publishedAt))
      .limit(limit);
  } catch (err) {
    logger.warn({ err }, "Drizzle fetch failed, falling back to Supabase API");
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      url: p.url,
      thumbnailUrl: p.thumbnail_url,
      duration: p.duration,
      publishedAt: new Date(p.published_at),
      createdAt: new Date(p.created_at)
    }));
  }
}

export async function insertSubscriber(values: any) {
  try {
    const { subscribersTable } = await import("@workspace/db/schema");
    const [subscriber] = await db.insert(subscribersTable).values(values).returning();
    return { ...subscriber, subscribedAt: subscriber.subscribedAt.toISOString() };
  } catch (err) {
    logger.warn({ err }, "Drizzle insert failed, falling back to Supabase API");
    const { data, error } = await supabase
      .from('subscribers')
      .insert({
        name: values.name,
        email: values.email,
        phone: values.phone,
        wants_whatsapp: values.wantsWhatsapp,
        whatsapp_approved: values.whatsappApproved || false
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      wantsWhatsapp: data.wants_whatsapp,
      whatsappApproved: data.whatsapp_approved,
      subscribedAt: new Date(data.subscribed_at).toISOString()
    };
  }
}

export async function insertMessage(values: any) {
  try {
    const { messagesTable } = await import("@workspace/db/schema");
    const [msg] = await db.insert(messagesTable).values(values).returning();
    return {
      ...msg,
      readAt: msg.readAt ? msg.readAt.toISOString() : null,
      createdAt: msg.createdAt.toISOString(),
    };
  } catch (err) {
    logger.warn({ err }, "Drizzle insert failed, falling back to Supabase API");
    const { data, error } = await supabase
      .from('messages')
      .insert({
        type: values.type,
        subject: values.subject,
        body: values.body,
        sender_email: values.senderEmail
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      type: data.type,
      subject: data.subject,
      body: data.body,
      senderEmail: data.sender_email,
      readAt: data.read_at ? new Date(data.read_at).toISOString() : null,
      createdAt: new Date(data.created_at).toISOString()
    };
  }
}

export async function verifyAdminCredentials(login: string) {
  const normalizedLogin = login.toLowerCase().trim();
  try {
    const { adminUsersTable } = await import("@workspace/db/schema");
    const { or, eq } = await import("drizzle-orm");
    const [user] = await db
      .select()
      .from(adminUsersTable)
      .where(or(
        eq(adminUsersTable.email, normalizedLogin),
        eq(adminUsersTable.username, normalizedLogin)
      ));
    return user || null;
  } catch (err) {
    logger.warn({ err }, "Drizzle auth lookup failed, falling back to Supabase API");
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .or(`email.eq.${normalizedLogin},username.eq.${normalizedLogin}`)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      passwordHash: data.password_hash,
      role: data.role,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

export async function getAdminById(id: number) {
  try {
    const { adminUsersTable } = await import("@workspace/db/schema");
    const { eq } = await import("drizzle-orm");
    const [user] = await db
      .select({ id: adminUsersTable.id, username: adminUsersTable.username, email: adminUsersTable.email, role: adminUsersTable.role })
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, id));
    return user || null;
  } catch (err) {
    logger.warn({ err }, "Drizzle getAdminById failed, falling back to Supabase API");
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, email, role')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data || null;
  }
}

export async function getOrders() {
  try {
    const { ordersTable } = await import("@workspace/db/schema");
    const { desc } = await import("drizzle-orm");
    return await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  } catch (err) {
    logger.warn({ err }, "Drizzle getOrders failed, fallback to REST");
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(o => ({
      ...o,
      createdAt: new Date(o.created_at),
      bookId: o.book_id,
      bookTitle: o.book_title,
      orderType: o.order_type,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      deliveryAddress: o.delivery_address,
      deliveryCity: o.delivery_city,
      totalAmount: o.total_amount,
      vatAmount: o.vat_amount
    }));
  }
}

export async function getStats() {
  try {
    const { ordersTable, subscribersTable, contactMessagesTable } = await import("@workspace/db/schema");
    const { sql } = await import("drizzle-orm");
    const [ordersCount] = await db.select({ count: sql`count(*)` }).from(ordersTable);
    const [subsCount] = await db.select({ count: sql`count(*)` }).from(subscribersTable);
    const [msgCount] = await db.select({ count: sql`count(*)` }).from(contactMessagesTable);
    const [totalRevenue] = await db.select({ sum: sql`sum(total_amount)` }).from(ordersTable);
    
    return {
      totalOrders: Number(ordersCount.count),
      totalSubscribers: Number(subsCount.count),
      totalMessages: Number(msgCount.count),
      totalRevenue: Number(totalRevenue.sum || 0)
    };
  } catch (err) {
    logger.warn({ err }, "Drizzle getStats failed, fallback to REST individual counts");
    const { count: orders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: subs } = await supabase.from('subscribers').select('*', { count: 'exact', head: true });
    const { count: msgs } = await supabase.from('contact_messages').select('*', { count: 'exact', head: true });
    
    // Revenue is harder with REST without summing locally
    const { data: revData } = await supabase.from('orders').select('total_amount');
    const revenue = (revData || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

    return {
      totalOrders: orders || 0,
      totalSubscribers: subs || 0,
      totalMessages: msgs || 0,
      totalRevenue: revenue
    };
  }
}

export async function insertOrder(values: any) {
  try {
    const { ordersTable } = await import("@workspace/db/schema");
    const [order] = await db.insert(ordersTable).values(values).returning();
    return order;
  } catch (err) {
    logger.error({ err, values }, "Drizzle insertOrder failed");
    logger.warn("Falling back to Supabase API for insertOrder");
    const restValues = {
      book_id: values.bookId,
      book_title: values.bookTitle,
      order_type: values.orderType,
      customer_name: values.customerName,
      customer_email: values.customerEmail,
      customer_phone: values.customerPhone,
      delivery_address: values.deliveryAddress,
      delivery_city: values.deliveryCity,
      notes: values.notes,
      quantity: values.quantity || 1,
      total_amount: values.totalAmount,
      vat_amount: values.vatAmount,
      status: values.status || 'pending'
    };
    logger.info({ restValues }, "Sending order to Supabase REST");
    const { data, error } = await supabase.from('orders').insert(restValues).select().single();
    if (error) {
      logger.error({ error }, "Supabase fallback insertOrder failed");
      throw error;
    }
    return {
      ...data,
      bookId: data.book_id,
      bookTitle: data.book_title,
      orderType: data.order_type,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      customerPhone: data.customer_phone,
      deliveryAddress: data.delivery_address,
      deliveryCity: data.delivery_city,
      totalAmount: data.total_amount,
      vatAmount: data.vat_amount,
      createdAt: new Date(data.created_at)
    };
  }
}

export async function getBooks() {
  try {
    const { booksTable } = await import("@workspace/db/schema");
    return await db.select().from(booksTable);
  } catch (err: any) {
    logger.warn({ msg: err.message, stack: err.stack }, "Drizzle getBooks primary failed, attempting fallback...");
    try {
      const { data: books, error } = await supabase
        .from('books')
        .select('*');
      
      if (error) {
        logger.error({ error }, "Supabase REST fallback for getBooks failed");
        throw error;
      }
      
      if (!books || books.length === 0) {
        logger.warn("Supabase REST returned zero books");
        return [];
      }

      return books.map(b => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        description: b.description,
        author: b.author,
        coverImage: b.cover_image,
        type: b.type,
        hardcopyPrice: b.hardcopy_price,
        ebookPrice: b.ebook_price,
        currency: b.currency,
        isLatest: b.is_latest,
        publishedYear: b.published_year,
        category: b.category,
        createdAt: new Date(b.created_at)
      }));
    } catch (fallbackErr: any) {
       logger.error({ msg: fallbackErr.message }, "Both Drizzle and Supabase fallback failed for getBooks");
       throw fallbackErr;
    }
  }
}

export async function insertBook(values: any) {
  try {
    const { booksTable } = await import("@workspace/db/schema");
    const [book] = await db.insert(booksTable).values(values).returning();
    return book;
  } catch (err) {
    logger.warn({ err }, "Drizzle insertBook failed, fallback to REST");
    const restValues = {
      title: values.title,
      subtitle: values.subtitle,
      description: values.description,
      author: values.author,
      cover_image: values.coverImage,
      type: values.type,
      hardcopy_price: values.hardcopyPrice,
      ebook_price: values.ebookPrice,
      currency: values.currency,
      is_latest: values.isLatest,
      published_year: values.publishedYear,
      category: values.category
    };
    const { data, error } = await supabase.from('books').insert(restValues).select().single();
    if (error) throw error;
    return {
      ...data,
      coverImage: data.cover_image,
      hardcopyPrice: data.hardcopy_price,
      ebookPrice: data.ebook_price,
      isLatest: data.is_latest,
      publishedYear: data.published_year
    };
  }
}

export async function updateBook(id: number, values: any) {
  try {
    const { booksTable } = await import("@workspace/db/schema");
    const { eq } = await import("drizzle-orm");
    const [book] = await db.update(booksTable).set(values).where(eq(booksTable.id, id)).returning();
    return book;
  } catch (err) {
    logger.warn({ err }, "Drizzle updateBook failed, fallback to REST");
    const restValues: any = {};
    if (values.title !== undefined) restValues.title = values.title;
    if (values.subtitle !== undefined) restValues.subtitle = values.subtitle;
    if (values.description !== undefined) restValues.description = values.description;
    if (values.author !== undefined) restValues.author = values.author;
    if (values.coverImage !== undefined) restValues.cover_image = values.coverImage;
    if (values.type !== undefined) restValues.type = values.type;
    if (values.hardcopyPrice !== undefined) restValues.hardcopy_price = values.hardcopyPrice;
    if (values.ebookPrice !== undefined) restValues.ebook_price = values.ebookPrice;
    if (values.currency !== undefined) restValues.currency = values.currency;
    if (values.isLatest !== undefined) restValues.is_latest = values.isLatest;
    if (values.publishedYear !== undefined) restValues.published_year = values.publishedYear;
    if (values.category !== undefined) restValues.category = values.category;

    const { data, error } = await supabase.from('books').update(restValues).eq('id', id).select().single();
    if (error) throw error;
    return {
        ...data,
        coverImage: data.cover_image,
        hardcopyPrice: data.hardcopy_price,
        ebookPrice: data.ebook_price,
        isLatest: data.is_latest,
        publishedYear: data.published_year
    };
  }
}

export async function deleteBook(id: number) {
  try {
    const { booksTable } = await import("@workspace/db/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(booksTable).where(eq(booksTable.id, id));
    return true;
  } catch (err) {
    logger.warn({ err }, "Drizzle deleteBook failed, fallback to REST");
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

export async function getMessages() {
  try {
    const { contactMessagesTable } = await import("@workspace/db/schema");
    const { desc } = await import("drizzle-orm");
    return await db.select().from(contactMessagesTable).orderBy(desc(contactMessagesTable.createdAt));
  } catch (err) {
    logger.warn({ err }, "Drizzle getMessages failed, fallback to REST");
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(m => ({
      ...m,
      createdAt: new Date(m.created_at)
    }));
  }
}

export async function getSubscribers() {
  try {
    const { subscribersTable } = await import("@workspace/db/schema");
    const { desc } = await import("drizzle-orm");
    return await db.select().from(subscribersTable).orderBy(desc(subscribersTable.createdAt));
  } catch (err) {
    logger.warn({ err }, "Drizzle getSubscribers failed, fallback to REST");
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(s => ({
      ...s,
      createdAt: new Date(s.created_at)
    }));
  }
}
