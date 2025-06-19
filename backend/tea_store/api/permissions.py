from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    '''
    Кастомное разрешение, позволяющее ЛЮБЫМ пользователям смотреть карточку, но только владельцу редактировать. 
    '''
    def has_permission(self, request, view): # Этот метод проверяет, может ли пользователь получить доступ к api вообще
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj): # Этот метод проеряет, может ли пользователь получить достп к определённому объекту
        if request.method in permissions.SAFE_METHODS: # SAFE_METHODS - запросы GET, HEAD, OPTIONS т.е. те, которые не дадут редактировать карточку. Только смотреть
            return True  
  
        return obj.author == request.user # Для любых методов возвращаем True, если это владелец карточки