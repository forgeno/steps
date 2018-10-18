from django.shortcuts import render


# Create your views here.

def index(request):
    return render(request, 'steps-app/public/index.html', {})

def about_page(request):
    # text = """About Page for STEPS."""
    # return HttpResponse(text)
    return render(request, "about.html", {})

def statistics_page(request):
    return render(request, "statistics.html", {})