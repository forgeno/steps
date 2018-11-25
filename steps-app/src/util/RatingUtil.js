export const getRatingDescription = (rating) => {
	if (rating < 1.5) {
		return "Poor";
	} else if (rating < 2.5) {
		return "Bad";
	} else if (rating < 3.5) {
		return "Average";
	} else if (rating < 4.5) {
		return "Great";
	}
	return "Excellent";
};