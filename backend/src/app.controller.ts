import { Controller, Post, Body, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './vote/vote.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
  ) {}

  @Post('/vote')
  async vote(@Body() body: { team: string }) {
    const vote = this.voteRepository.create({ team: body.team });
    return this.voteRepository.save(vote);
  }

  @Get('/votes')
  async getVotes() {
    const [sevilla, betis] = await Promise.all([
      this.voteRepository.count({ where: { team: 'sevilla' } }),
      this.voteRepository.count({ where: { team: 'betis' } }),
    ]);
    return { sevilla, betis };
  }
}
