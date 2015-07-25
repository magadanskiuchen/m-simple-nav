var i18n = {};
var locale = window.navigator.language.split('-')[0];

switch (locale) {
	case 'bg':
		i18n.geocode_error = 'Координат не могат да се достъпят. Проверете интернет връзката си.';
		i18n.geocode_invalid_request = 'Свържете се с програмиста и докладвайте за грешка с невалидна заявка.';
		i18n.geocode_over_query_limit = 'Направили сте прекалено много заявки за твърде кратко време. Опитайте отново след 10 минути.';
		i18n.geocode_request_denied = 'Свържете се с програмиста и докладвайте за грешка с отказана заявка.';
		i18n.geocode_unknown_error = 'Опа, не успяхме да намерим това, което търсите. Моля опитайте отново.';
		i18n.geocode_zero_results = 'Не са намерени резултати за този адрес. Променете адреса и опитайте отново.';
		break;
	case 'en':
	default:
		i18n.geocode_error = 'Cannot get coordinates for location. Check your internet connection.';
		i18n.geocode_invalid_request = 'Contact the developer and let them know that an invalid request error occured.';
		i18n.geocode_over_query_limit = 'You have made too many queries for too short time. Try again in 10 minutes.';
		i18n.geocode_request_denied = 'Contact the developer and let them know that a request denied error occured.';
		i18n.geocode_unknown_error = 'Ooops, we could not find what you were looking for. Please try again.';
		i18n.geocode_zero_results = 'No results were found for that address. Please try modifying that and searching again.';
		break;
}
