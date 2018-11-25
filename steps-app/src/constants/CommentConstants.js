export const COMMENTS_PER_PAGE = 25,
	COMMENT_ERROR_STATE = "error",
	COMMENT_PROFANITY_MESSAGE = "This comment has profanity or personal information in it.",
	EMPTY_COMMENT_MESSAGE = "You can not post an empty comment.",
	// taken from https://stackoverflow.com/a/39418863
	PHONE_REGEX = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/img,
	SECONDARY_PHONE_REGEX = /[0-9]{3}.[0-9]{3}.[0-9]{4}/;