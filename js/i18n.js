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
		
		i18n.favorites_data_storage_setup_error = 'Възникна грешка при създаването на списъка с любими места. Моля свържете се с програмиста.';
		i18n.saving_location_error = 'Възникна грешка при записването на мястото. Моля опитайте отново и ако проблемът продължи се свържете с програмиста.';
		i18n.entries_retrieval_error = 'Записите не могат да бъдат прочетени. Моля свържете се с програмиста.';
		i18n.delete_error = 'Възникна грешка при изтриването. Моля опитайте отново. Ако проблемът продължи се свържете с програмиста.';
		
		i18n.are_you_sure = 'Сигурни ли сте?';
		break;
	case 'en':
	default:
		i18n.geocode_error = 'Cannot get coordinates for location. Check your internet connection.';
		i18n.geocode_invalid_request = 'Contact the developer and let them know that an invalid request error occured.';
		i18n.geocode_over_query_limit = 'You have made too many queries for too short time. Try again in 10 minutes.';
		i18n.geocode_request_denied = 'Contact the developer and let them know that a request denied error occured.';
		i18n.geocode_unknown_error = 'Ooops, we could not find what you were looking for. Please try again.';
		i18n.geocode_zero_results = 'No results were found for that address. Please try modifying that and searching again.';
		
		i18n.favorites_data_storage_setup_error = 'There was an error with setting up favorites data storage. Please contact the developer.';
		i18n.saving_location_error = 'There was an error saving your location. Please try again. If this remains happening contact the developer.';
		i18n.entries_retrieval_error = 'Could not retrieve entries. Please contact developer.';
		i18n.delete_error = 'Deletion failed. Please try again. Is the issue persists contact the developer.';
		
		i18n.are_you_sure = 'Are you sure?';
		break;
}
