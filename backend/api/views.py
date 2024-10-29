from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

def hello(request):
    return HttpResponse("Hello TdA")

def api(request):
    return JsonResponse({"organization": "Student Cyber Games"})