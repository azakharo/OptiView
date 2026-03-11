import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for LQIP (Low-Quality Image Placeholder) response.
 * Returns the base64-encoded low-quality image for blur-up loading effect.
 */
export class LqipResponseDto {
  @ApiProperty({
    type: String,
    description: 'Low-quality image placeholder as base64-encoded string',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
  })
  lqipBase64: string;
}
