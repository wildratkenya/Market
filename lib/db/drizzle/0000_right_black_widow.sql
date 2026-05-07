CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'editor', 'readonly');--> statement-breakpoint
CREATE TYPE "public"."book_type" AS ENUM('hardcopy', 'ebook', 'both');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('hardcopy', 'ebook');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('order', 'contact', 'subscription');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "admin_role" DEFAULT 'readonly' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username"),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"cover_image" text,
	"category" text,
	"published" boolean DEFAULT true NOT NULL,
	"published_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text NOT NULL,
	"author" text DEFAULT 'Jamuhuri Gachoroba' NOT NULL,
	"cover_image" text,
	"type" "book_type" DEFAULT 'both' NOT NULL,
	"hardcopy_price" numeric(10, 2),
	"ebook_price" numeric(10, 2),
	"currency" text DEFAULT 'KES' NOT NULL,
	"is_latest" boolean DEFAULT false NOT NULL,
	"published_year" integer,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"book_title" text NOT NULL,
	"order_type" "order_type" NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text,
	"delivery_address" text,
	"delivery_city" text,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total_amount" text,
	"vat_amount" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "podcasts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"audio_url" text,
	"buzzsprout_url" text,
	"duration" text,
	"episode_number" integer,
	"season" integer,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"thumbnail_url" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"wants_whatsapp" boolean DEFAULT false NOT NULL,
	"whatsapp_approved" boolean DEFAULT false NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "message_type" NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"sender_email" text,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_name" text NOT NULL,
	"page_title" text NOT NULL,
	"hero_title" text,
	"hero_subtitle" text,
	"hero_description" text,
	"hero_image" text,
	"hero_button" text,
	"hero_button_text" text,
	"body_content" text,
	"footer_content" text,
	"phone" text,
	"email" text,
	"address" text,
	"social_links" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_pages_page_name_unique" UNIQUE("page_name")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;