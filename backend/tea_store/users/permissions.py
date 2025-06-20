from django.contrib.auth.decorators import login_required
from django.views.generic import View
from django.utils.decorators import method_decorator

@method_decorator(login_required, name='dispatch')
class ProtectedView(View):
    def get(self, request):
        return HttpResponse("This is protected content")
