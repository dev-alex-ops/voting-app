/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { VoteService } from './vote.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from '../user/user.service';

@Controller('votes')
export class VoteController {
  constructor(
    private voteService: VoteService,
    private userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async vote(@Body('team') team: string, @Request() req) {
    const user = await this.userService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.voteService.vote(team, user); // retorna { message: string }
  }

  @Get()
  async count() {
    return this.voteService.countVotes();
  }
}
