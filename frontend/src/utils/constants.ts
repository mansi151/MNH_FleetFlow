// HTTP Methods
export const GET = "GET";
export const POST = "POST";
export const POST_RAW = "POST_RAW";
export const POST_FORM = "POST_FORM";
export const PATCH = "PATCH";
export const PUT = "PUT";
export const DELETE = "DELETE";

// Extended Method Types
export const GET_ID_PARAMS = "GET_ID_PARAMS";
export const GET_URL_PARAMS = "GET_URL_PARAMS";
export const GET_URL_ID_PARAMS = "GET_URL_ID_PARAMS";
export const GET_URL_ENCODED = "GET_URL_ENCODED";

export const POST_ID_PARAMS = "POST_ID_PARAMS";
export const POST_URL_PARAMS = "POST_URL_PARAMS";
export const POST_URL_ENCODED = "POST_URL_ENCODED";
export const POST_URL_ENCODED_ID_PARAMS = "POST_URL_ENCODED_ID_PARAMS";

export const PATCH_ID = "PATCH_ID";
export const PATCH_FORM = "PATCH_FORM";
export const PATCH_FORM_ID = "PATCH_FORM_ID";
export const PATCH_FORM_ID_URL_ENCODED = "PATCH_FORM_ID_URL_ENCODED";
export const PATCH_URL_ENCODED = "PATCH_URL_ENCODED";

export const DELETE_ID_PARAMS = "DELETE_ID_PARAMS";
export const DELETE_ID_QUERY_PARAMS = "DELETE_ID_QUERY_PARAMS";
export const DELETE_URL_PARAMS = "DELETE_URL_PARAMS";
export const DELETE_URL_ENCODED = "DELETE_URL_ENCODED";

export const MULTI_PART_POST = "MULTI_PART_POST";
export const MULTI_PART_ID_PATCH = "MULTI_PART_ID_PATCH";
export const MULTI_PART_ID_POST = "MULTI_PART_ID_POST";

// Status Codes
export const ResponseSuccess = 200;
export const ResponseCreated = 201;
export const ResponseFail = 400;
export const AuthError = 401;
export const Forbidden = 403;
export const NotFound = 404;
export const Upgrade = 402;
export const ServerError = 500;

// Configuration
export const BASE_URL = "http://localhost:3000/";

export const PAGE_LIMIT = 10;
