import { Controller, Get } from '@nestjs/common';
import { ROLES } from '../../common/constants/roles';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { CurrentUser } from '../../common/interfaces/current-user.interface';
import { DashboardService } from './dashboard.service';

@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard/overview')
  getOverview(@CurrentUserDecorator() user: CurrentUser) {
    return this.dashboardService.getOverview(user);
  }

  @Roles(ROLES.ADMIN, ROLES.RISK_ANALYST)
  @Get('admin/monitoring/metrics')
  getAdminMetrics() {
    return this.dashboardService.getAdminMetrics();
  }
}
