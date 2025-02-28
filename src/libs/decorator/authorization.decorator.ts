import { SKIP_AUTH } from "@constant/meta-key.constant";
import { SetMetadata } from "@nestjs/common";

export const Public = () => SetMetadata(SKIP_AUTH, true);
