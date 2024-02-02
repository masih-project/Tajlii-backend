import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type ProvinceDocument = HydratedDocument<Province>;

export class Province {
  @Prop({ default: 'string' })
  name: string;

  @Prop(
    raw({
      name: {
        type: String,
        default: 'string',
      },
    }),
  )
  cities: City[];
}
@Schema({
  timestamps: true,
  versionKey: false,
})
class City {
  @Prop({ type: String })
  name: string;
}
export const proviceSchema = SchemaFactory.createForClass(Province);
