from django.db import models
from vendors.models import FabricItem


class CatalogueEntry(models.Model):
    fabric = models.OneToOneField(FabricItem, on_delete=models.CASCADE, related_name='catalogue_entry')
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    featured = models.BooleanField(default=False)

    def __str__(self):
        return f"Catalogue: {self.fabric.name}"
