import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../common/interfaces/current-user.interface';
import { AlertsService } from './alerts.service';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  listAlerts(@CurrentUserDecorator() user: CurrentUser) {
    return this.alertsService.list(user);
  }

  @Patch(':alertId')
  updateAlert(
    @Param('alertId') alertId: string,
    @Body() dto: UpdateAlertDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.alertsService.update(alertId, dto, user);
  }
}
