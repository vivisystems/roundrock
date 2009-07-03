(function() {

    var __component__ = {

        name: 'Package',
        
        // configuration keys
        _PackageKey: 'vivipos.fec.registry.package',
        _PackageNameKey: 'vivipos.fec.registry.package-location',
        _PackageTimezoneKey: 'vivipos.fec.registry.package-timezone',

        loadData: function(resolution) {

            // initialize locations
            var Locations = [];
            var Sectors = {};
            var PackageList = GeckoJS.Configure.read(this._PackageKey);

            GeckoJS.BaseObject.getKeys(PackageList).forEach(function(location) {
                // need to make sure location contains sectors with support resolution
                var sectors =[];
                var packages = PackageList[location];
                var location_label = GeckoJS.Configure.read(this._PackageNameKey + '.' + location);
                
                // retrieve localization string bundle if present
                if (location_label) {
                    if (location_label.indexOf('chrome://') == 0) {
                        location_label = GeckoJS.StringBundle.getPrefLocalizedString(this._PackageNameKey + '.' + location);
                    }
                    else {
                        location_label = _(location_label);
                    }
                }
                else {
                    location_label = _('(location)' + location)
                }

                var location_tz = GeckoJS.Configure.read(this._PackageTimezoneKey + '.' + location);

                for (var sector in packages) {
                    var pkg = GREUtils.extend({}, packages[sector]);
                    if (pkg && pkg.resolutions && (!resolution || (pkg.resolutions.indexOf(resolution) != -1))) {

                        // retrieve localized sector label
                        var label = pkg.label || '';
                        if (label && label.indexOf('chrome://') == 0) {
                            label = GeckoJS.StringBundle.getPrefLocalizedString(this._PackageKey + '.' + location + '.' + sector + '.label');
                        }
                        else {
                            label = _('(sector)' + label);
                        }

                        // retrieve localized sector description
                        var desc = pkg.description || '';
                        if (desc && desc.indexOf('chrome://') == 0) {
                            desc = GeckoJS.StringBundle.getPrefLocalizedString(this._PackageKey + '.' + location + '.' + sector + '.description');
                        }
                        else {
                            desc = _(desc);
                        }

                        pkg.label = label;
                        pkg.description = desc;
                        pkg.sector = sector;

                        sectors.push(pkg);
                    }
                }

                if (sectors.length > 0) {
                    Locations.push({label: location_label, location: location, timezone: location_tz});

                    sectors.sort(function(a, b) {
                                     if (a.label > b.label)
                                         return 1;
                                     else if (a.label < b.label)
                                         return -1
                                     else
                                         return 0;
                    });
                    Sectors[location] = sectors;
                }
            }, this);

            // sort locations by label
            Locations.sort(function(a, b) {
                               if (a.label > b.label)
                                   return -1;
                               else if (a.label < b.label)
                                   return 1;
                               else
                                   return 0;
                           });
            return {packages: PackageList, locations: Locations, sectors: Sectors};
        }
    }

    var PackageComponent = window.PackageComponent = GeckoJS.Component.extend(__component__);

})()
