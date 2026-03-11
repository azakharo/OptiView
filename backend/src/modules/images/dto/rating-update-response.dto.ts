import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for rating update response.
 * Returns the updated image ID, new rating, and timestamp of update.
 */
export class RatingUpdateResponseDto {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the image (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    type: Number,
    description: 'Updated rating for the image (1-5 scale)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @ApiProperty({
    type: Date,
    description: 'Timestamp when the rating was updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
