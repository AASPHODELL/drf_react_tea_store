from rest_framework.response import Response
from rest_framework import status
from functools import wraps

def drf_admin_required(view_func):
    """
    Декоратор для DRF API views, возвращает JSON при ошибке
    """
    @wraps(view_func)
    def _wrapped_view(self, *args, **kwargs):
        if not args[0].user.is_staff:
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )
        return view_func(args[0], *args, **kwargs)
    return _wrapped_view
