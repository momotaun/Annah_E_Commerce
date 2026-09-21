import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateReviewDto } from './create-review.dto';

async function validateDto(overrides: Record<string, unknown>) {
  const dto = plainToInstance(CreateReviewDto, { rating: 5, ...overrides });
  return validate(dto);
}

describe('CreateReviewDto rating', () => {
  it('rejects a missing rating', async () => {
    const errors = await validateDto({ rating: undefined });
    expect(errors.find((e) => e.property === 'rating')).toBeDefined();
  });

  it('allows every rating from 1 to 5', async () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      const errors = await validateDto({ rating });
      expect(errors.find((e) => e.property === 'rating')).toBeUndefined();
    }
  });

  it('rejects a rating of 0', async () => {
    const errors = await validateDto({ rating: 0 });
    expect(errors.find((e) => e.property === 'rating')).toBeDefined();
  });

  it('rejects a rating above 5', async () => {
    const errors = await validateDto({ rating: 6 });
    expect(errors.find((e) => e.property === 'rating')).toBeDefined();
  });

  it('rejects a non-integer rating', async () => {
    const errors = await validateDto({ rating: 4.5 });
    expect(errors.find((e) => e.property === 'rating')).toBeDefined();
  });
});

describe('CreateReviewDto comment', () => {
  it('allows a missing comment', async () => {
    const errors = await validateDto({ comment: undefined });
    expect(errors.find((e) => e.property === 'comment')).toBeUndefined();
  });

  it('allows a normal comment', async () => {
    const errors = await validateDto({ comment: 'Great fit, true to size.' });
    expect(errors.find((e) => e.property === 'comment')).toBeUndefined();
  });

  it('rejects a comment over 1000 characters', async () => {
    const errors = await validateDto({ comment: 'a'.repeat(1001) });
    expect(errors.find((e) => e.property === 'comment')).toBeDefined();
  });
});
