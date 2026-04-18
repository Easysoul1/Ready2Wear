from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    if not (isinstance(response.data, dict) and response.data.get('success') is False):
        response.data = {'success': False, 'errors': response.data}
    return response
