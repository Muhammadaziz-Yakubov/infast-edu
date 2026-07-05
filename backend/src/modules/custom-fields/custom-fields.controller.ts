import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDefinitionDto } from './dto/create-custom-field-definition.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('custom-fields')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('custom-field-definitions')
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  @Post()
  @ApiOperation({ summary: 'Create custom field definition (Admin only)' })
  @ApiResponse({ status: 201, description: 'Field created successfully.' })
  create(@Body() dto: CreateCustomFieldDefinitionDto) {
    return this.customFieldsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all custom field definitions' })
  @ApiResponse({ status: 200, description: 'List of field definitions.' })
  findAll() {
    return this.customFieldsService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete custom field definition (Admin only)' })
  @ApiResponse({ status: 200, description: 'Field deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.customFieldsService.remove(id);
  }
}
