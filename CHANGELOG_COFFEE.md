# Optimizations

* Reduced memory consumption moving local to global defined util functions.
* Extends `extraParams` being a plain object (with downgrade compatibility).
* Changes Ajax call from $.getJSON to the more flexible $.ajax and introducing `ajaxOptions`.