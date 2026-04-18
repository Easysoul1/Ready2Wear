from rest_framework.renderers import JSONRenderer


class EnvelopedJSONRenderer(JSONRenderer):
    """Wrap all API payloads in a consistent envelope."""

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None

        if response is None or response.status_code == 204:
            return super().render(data, accepted_media_type, renderer_context)

        if isinstance(data, dict) and 'success' in data and ('data' in data or 'errors' in data):
            payload = data
        elif response.status_code >= 400:
            payload = {'success': False, 'errors': data}
        else:
            payload = {'success': True, 'data': data}

        return super().render(payload, accepted_media_type, renderer_context)
