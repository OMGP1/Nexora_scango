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
}

export const ProductSchema = SchemaFactory.createForClass(Product);
