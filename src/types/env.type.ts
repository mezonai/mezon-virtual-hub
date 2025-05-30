export interface AuthEnv {
  // google: GoogleEnv;
  // jwt: JwtConfigEnv;
  // publicSecretKey: string;
  oauth2: Oauth2Env;
}

export interface GoogleEnv {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

export interface JwtConfigEnv {
  access: JwtSecret;
  refresh: JwtSecret;
  issuer: string;
  audience: string;
}

export interface JwtSecret {
  expiresIn: string;
  secret: string;
}

export interface Oauth2Env {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  api_url: string;
  scope: string;
  response_type: string;
  grant_types: string;
}

export interface MezonEnv {
  appToken: string;
  expiresTimeOffset: string | number;
}
