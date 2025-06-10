import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { HydratedDocument,Document } from "mongoose";

@Schema()


export class Fileupload extends Document {
    @Prop({required: true})
    filename: string;

    @Prop({required: true})
    url: string;

    @Prop({required: true})
    format: string;

    @Prop({required: true})
    size: number;

    @Prop({type:Date, default:Date.now})
    uploadedAt: Date;
  }

export const ItemSchema = SchemaFactory.createForClass(Fileupload);