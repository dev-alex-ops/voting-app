import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';
import { User } from '../user/user.entity';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepo: Repository<Vote>,
  ) {}

  async vote(team: string, user: User): Promise<{ message: string }> {
    const existing = await this.voteRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['user'], // por si necesitas acceder al user
    });

    if (existing) {
      existing.team = team;
      await this.voteRepo.save(existing);
      return { message: 'Voto modificado' };
    }

    const vote = this.voteRepo.create({ team, user });
    await this.voteRepo.save(vote);
    return { message: 'Voto emitido' };
  }

  async countVotes() {
    const votes = await this.voteRepo.find();
    return {
      sevilla: votes.filter((v) => v.team === 'sevilla').length,
      betis: votes.filter((v) => v.team === 'betis').length,
    };
  }
}
