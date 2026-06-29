import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('market')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post('rewards')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new reward item in the shop (Admin only)' })
  @ApiResponse({ status: 201, description: 'Reward created.' })
  createReward(@Body() createRewardDto: CreateRewardDto) {
    return this.marketService.createReward(createRewardDto);
  }

  @Get('rewards')
  @ApiOperation({ summary: 'Get all reward items available in the shop' })
  @ApiResponse({ status: 200, description: 'List of shop rewards.' })
  findAllRewards() {
    return this.marketService.getAllRewards();
  }

  @Get('rewards/:id')
  @ApiOperation({ summary: 'Get reward item details by ID' })
  @ApiResponse({ status: 200, description: 'Reward item.' })
  findReward(@Param('id') id: string) {
    return this.marketService.getRewardById(id);
  }

  @Patch('rewards/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update reward item details (Admin only)' })
  updateReward(@Param('id') id: string, @Body() updateRewardDto: any) {
    return this.marketService.updateReward(id, updateRewardDto);
  }

  @Delete('rewards/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete reward item (Admin only)' })
  removeReward(@Param('id') id: string) {
    return this.marketService.removeReward(id);
  }

  @Post('rewards/:id/purchase')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Redeem/purchase a shop item using coins (Student only)' })
  @ApiResponse({ status: 200, description: 'Purchase successful, coins/stock updated.' })
  purchase(@Param('id') id: string, @CurrentUser() user: any) {
    return this.marketService.purchaseReward(user.userId, id);
  }

  @Get('my-purchases')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get current student shop purchase history' })
  @ApiResponse({ status: 200, description: 'List of purchases.' })
  findOwnPurchases(@CurrentUser() user: any) {
    return this.marketService.getStudentPurchaseHistory(user.userId);
  }

  @Get('purchases')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all store purchases history (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all system transactions.' })
  findAllPurchases() {
    return this.marketService.getAllPurchaseHistory();
  }
}
