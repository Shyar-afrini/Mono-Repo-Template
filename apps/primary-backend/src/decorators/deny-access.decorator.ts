import { SetMetadata } from '@nestjs/common';

export const DENY_ACCESS_KEY = 'deny-access';

export const DenyAccess = () => SetMetadata(DENY_ACCESS_KEY, true);
