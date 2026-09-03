import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true, index: true })
  sku: string;

  @Prop({ required: true, unique: true, index: true })
  barcode: string;

  @Prop({ required: true, text: true })
  name: string;

  @Prop({ text: true })
  description: string;

  @Prop({ required: true })
  unit_price: number;

  @Prop({ required: true })
  tax_class: string;

  @Prop({ default: false })
  is_weight_based: boolean;

  @Prop({ default: false })
  is_age_restricted: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  category_id: string;

  @Prop()
  image_url: string;

  @Prop()
  uom: string;

  // v2 — Weight verification fields
  @Prop({ default: null })
  weight_in_grams: number;

  @Prop({ default: null })
  weight_tolerance_pct: number;

  @Prop({ type: Object, default: null })
  dimensions: {
    length_mm: number;
    width_mm: number;
    height_mm: number;
  };

  // v2 — RMN ad targeting (Phase 3 prep)
  @Prop({ type: Object, default: null })
  ad_tags: {
    rmn_eligible: boolean;
    category_path: string[];
    brand_id: string;
    sponsored_slots: string[];
  };
}

export const ProductSchema = SchemaFactory.createForClass(Product);
