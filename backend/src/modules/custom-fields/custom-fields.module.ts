import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomFieldsService } from './custom-fields.service';
import { CustomFieldsController } from './custom-fields.controller';
import { CustomFieldDefinition, CustomFieldDefinitionSchema } from './schemas/custom-field-definition.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomFieldDefinition.name, schema: CustomFieldDefinitionSchema },
    ]),
  ],
  controllers: [CustomFieldsController],
  providers: [CustomFieldsService],
  exports: [CustomFieldsService, MongooseModule],
})
export class CustomFieldsModule {}
