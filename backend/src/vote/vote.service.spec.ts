/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { VoteService } from './vote.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';

describe('VoteService', () => {
  let service: VoteService;
  let voteRepo: jest.Mocked<Repository<Vote>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoteService,
        {
          provide: getRepositoryToken(Vote),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VoteService>(VoteService);
    voteRepo = module.get(getRepositoryToken(Vote));
  });

  describe('vote', () => {
    const user: User = {
      id: 1,
      username: 'alex',
      password: 'secret',
      votes: [],
    };

    it('emite un nuevo voto si no existe', async () => {
      voteRepo.findOne.mockResolvedValue(null);
      voteRepo.create.mockReturnValue({
        team: 'betis',
        user,
        id: 0,
      });
      voteRepo.save.mockResolvedValue({
        id: 0,
        team: 'betis',
        user,
      } as Vote);

      const result = await service.vote('betis', user);

      expect(voteRepo.findOne).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
        relations: ['user'],
      });
      expect(voteRepo.create).toHaveBeenCalledWith({ team: 'betis', user });
      expect(voteRepo.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Voto emitido' });
    });

    it('modifica un voto existente', async () => {
      const existingVote = { id: 10, team: 'sevilla', user } as Vote;

      voteRepo.findOne.mockResolvedValue(existingVote);
      voteRepo.save.mockResolvedValue({
        id: existingVote.id,
        team: 'betis',
        user,
      } as Vote);

      const result = await service.vote('betis', user);

      expect(existingVote.team).toBe('betis');
      expect(voteRepo.save).toHaveBeenCalledWith(existingVote);
      expect(result).toEqual({ message: 'Voto modificado' });
    });
  });

  describe('countVotes', () => {
    it('cuenta los votos por equipo', async () => {
      voteRepo.find.mockResolvedValue([
        { team: 'sevilla' },
        { team: 'betis' },
        { team: 'sevilla' },
      ] as Vote[]);

      const result = await service.countVotes();

      expect(voteRepo.find).toHaveBeenCalled();
      expect(result).toEqual({ sevilla: 2, betis: 1 });
    });
  });
});
