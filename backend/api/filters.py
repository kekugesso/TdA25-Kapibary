import django_filters
from .models import CustomUser

class UserFilter(django_filters.FilterSet):
    username = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = CustomUser
        fields = ["username"]