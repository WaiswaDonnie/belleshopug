import { Field, ID, InputType, OmitType } from '@nestjs/graphql';
import { Product, VariationInput } from '../entities/product.entity';

@InputType()
class UpsertVariationsHasMany {
  upsert?: VariationInput[];
  @Field(() => [ID], { nullable: true })
  delete?: number[];
}

@InputType()
export class CreateProductInput extends OmitType(Product, [
  'id',
  'slug',
  'created_at',
  'updated_at',
  'orders',
  'pivot',
  'categories',
  'tags',
  'type',
  'shop',
  'related_products',
  'variation_options',
  'translated_languages',
  'ratings',
  'in_wishlist',
]) {
  @Field(() => [ID])
  categories?: string[];
  @Field(() => [ID])
  tags?: string[];
  @Field(() => UpsertVariationsHasMany)
  variation_options?: UpsertVariationsHasMany;
}
