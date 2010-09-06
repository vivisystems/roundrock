(function() {

    var _settings = {
            productsForm: {
                'cpDepartments': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.product.departments', acl:'acl_manage_departments', checkForAcl:'cpDepartments'},
                'cpProducts': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.product.plus', acl:'acl_manage_products', checkForAcl:'cpProducts'},
                'cpProductGroups': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.product.plugroups', acl:'acl_manage_plu_groups', checkForAcl:'cpProductGroups'},
                'cpCondiments': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.product.condiments', acl:'acl_manage_condiments', checkForAcl:'cpCondiments,cpCondimentsDock'},
                'cpCondimentsDock': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.product.static_condiments', acl:'acl_manage_condiments', checkForAcl:'cpCondiments,cpCondimentsDock'},
                'cpProductFilters': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.product.plufilters', acl:'acl_manage_plufilters', checkForAcl:'cpProductFilters'},
                'cpNonPluSettings': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.product.nonplu_setting', acl:'acl_manage_nonplu_setting', checkForAcl:'cpNonPluSettings'},
                'cpImagesManager': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.product.imagemanager', acl:'acl_manage_images', checkForAcl:'cpImagesManager'},
                'cpLabelPrinting': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.product.label_printing', acl:'acl_print_labels', checkForAcl:'cpLabelPrinting'},
                'cpStockControl': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.product.stocks', acl:'acl_manage_stock', checkForAcl:'cpStockControl'},
                'cpTaxes': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.product.taxes', acl:'acl_manage_taxes', checkForAcl:'cpTaxes'},

                'appearDept': {type:'css', method:'hidden', selector: '#departmentsAppearanceBox', checkForCss:'appearDeptColor,appearDeptFont'},
                'appearDeptColor': {type:'css', method:'hidden', selector: '#departmentsAppearanceColorBox', checkForCss:'appearDeptColor'},
                'appearDeptFont': {type:'css', method:'hidden', selector: '#departmentsAppearanceFontBox', checkForCss:'appearDeptFont'},

                'appearProduct': {type:'css', method:'hidden', selector: '*[module="productsAppearance"]', checkForCss:'appearProductImage,appearProductColor,appearProductFont'},
                'appearProductImage': {type:'css', method:'hidden', selector: '#productsAppearanceImageBox', checkForCss:'appearProductImage'},
                'appearProductColor': {type:'css', method:'hidden', selector: '#productsAppearanceColorBox', checkForCss:'appearProductColor'},
                'appearProductFont': {type:'css', method:'hidden', selector: '#productsAppearanceFontBox', checkForCss:'appearProductFont'},

                'appearProdGroup': {type:'css', method:'hidden', selector: '#productGroupsAppearanceBox', checkForCss:'appearProdGroupColor,appearProdGroupFont'},
                'appearProdGroupColor': {type:'css', method:'hidden', selector: '#productGroupsAppearanceColorBox', checkForCss:'appearProdGroupColor'},
                'appearProdGroupFont': {type:'css', method:'hidden', selector: '#productGroupsAppearanceFontBox', checkForCss:'appearProdGroupFont'},

                'appearCondment': {type:'css', method:'hidden', selector: '#condimentsAppearanceBox', checkForCss:'appearCondmentColor,appearCondmentFont'},
                'appearCondmentColor': {type:'css', method:'hidden', selector: '#condimentsAppearanceColorBox', checkForCss:'appearCondmentColor'},
                'appearCondmentFont': {type:'css', method:'hidden', selector: '#condimentsAppearanceFontBox', checkForCss:'appearCondmentFont'},

                'attrProdSetItem': {type:'css', method:'hidden', selector: '#plusXUL tab[module="productsSetItemAttr"]', checkForCss:'attrProdSetItem'},
                'attrProdBasic2': {type:'css', method:'hidden', selector: '#plusXUL tab[module="productsBasic2Attr"]', checkForCss:'attrProdStock,attrProdScale,attrProdMemo'},
                'attrProdCondiments': {type:'css', method:'hidden', selector: '#plusXUL tab[module="productsCondimentsAttr"]', checkForCss:'attrProdCondiments'},
                'attrProdGroups': {type:'css', method:'hidden', selector: '#plusXUL tab[module="productsGroupsAttr"]', checkForCss:'attrProdGroups'},

                'attrProdStock': {type:'css', method:'hidden', selector: '#plusXUL row[module="productsStockAttr"]', checkForCss:'attrProdStock'},
                'attrProdScale': {type:'css', method:'hidden', selector: '#plusXUL row[module="productsScaleAttr"]', checkForCss:'attrProdScale'},
                'attrProdMemo': {type:'css', method:'hidden', selector: '#plusXUL row[module="productsMemoAttr"]', checkForCss:'attrProdMemo'},

                'attrProdPriceLevelCss2': {type:'css', method:'hidden', selector: '#plusXUL #productsPriceLevel2Row', checkForCss:'attrProdPriceLevelCss2'},
                'attrProdPriceLevelCss3': {type:'css', method:'hidden', selector: '#plusXUL #productsPriceLevel3Row', checkForCss:'attrProdPriceLevelCss3'},
                'attrProdPriceLevelCss4': {type:'css', method:'hidden', selector: '#plusXUL #productsPriceLevel4Row', checkForCss:'attrProdPriceLevelCss4'},
                'attrProdPriceLevelCss5': {type:'css', method:'hidden', selector: '#plusXUL #productsPriceLevel5Row', checkForCss:'attrProdPriceLevelCss5'},
                'attrProdPriceLevelCss6': {type:'css', method:'hidden', selector: '#plusXUL #productsPriceLevel6Row', checkForCss:'attrProdPriceLevelCss6'},
                'attrProdPriceLevelCss7': {type:'css', method:'hidden', selector: '#plusXUL #productsPriceLevel7Row', checkForCss:'attrProdPriceLevelCss7'},
                'attrProdPriceLevelCss8': {type:'css', method:'hidden', selector: '#plusXUL #productsPriceLevel8Row', checkForCss:'attrProdPriceLevelCss8'},
                'attrProdPriceLevelCss9': {type:'css', method:'hidden', selector: '#plusXUL #productsPriceLevel9Row', checkForCss:'attrProdPriceLevelCss9'},
                'attrProdPriceLevelPref': {type:'prefs', method:'write', key:'vivipos.fec.settings.MaxPriceLevel', preftype:'integer'}

            },

            employeesForm: {
                'cpEmployees': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.employee.users', acl:'acl_manage_employees', checkForAcl:'cpEmployees'},
                'cpJobs': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.employee.jobs', acl:'acl_manage_employees', checkForAcl:'cpJobs'},
                'cpRoles': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.employee.roles', acl:'acl_manage_acl_groups', checkForAcl:'cpRoles'},
                'cpStorecontact': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.employee.storecontact', acl:'acl_manage_storecontact', checkForAcl:'cpStorecontact'}
            },

            activitiesForm: {
                'cpPricelevelschedule': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.activity.pricelevelschedule', acl:'acl_manage_price_level_schedule', checkForAcl:'cpPricelevelschedule'},
                'cpPromotionsManager': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.activity.promotions_manager', acl:'acl_manage_promotions', checkForAcl:'cpPromotionsManager'},

                'promoTriggerIndividualPlu': {type:'prefs', method:'remove', key:'vivipos.fec.registry.promotion.trigger.individual_plu'},
                'promoTriggerIndividualDept': {type:'prefs', method:'remove', key:'vivipos.fec.registry.promotion.trigger.individual_dept'},
                'promoTriggerIndividualGroup': {type:'prefs', method:'remove', key:'vivipos.fec.registry.promotion.trigger.individual_group'},
                'promoTriggerMultiDept': {type:'prefs', method:'remove', key:'vivipos.fec.registry.promotion.trigger.multi_dept'},
                'promoTriggerMultiGroup': {type:'prefs', method:'remove', key:'vivipos.fec.registry.promotion.trigger.multi_group'},
                'promoTypeAmountOff': {type:'prefs', method:'remove', key:'vivipos.fec.registry.promotion.type.amount_off'},
                'promoTypePercentageOff': {type:'prefs', method:'remove', key:'vivipos.fec.registry.promotion.type.percentage_off'},
                'promoTypeFixedValue': {type:'prefs', method:'remove', key:'vivipos.fec.registry.promotion.type.fixed_value'},
                'promoTypeCheapestOneFree': {type:'prefs', method:'remove', key:'vivipos.fec.registry.promotion.type.cheapest_one_free'},
                'promoTypeMultiBuy': {type:'prefs', method:'remove', key:'vivipos.fec.registry.promotion.type.multi_buy'}
            },

            toolsForm: {
                'cpAddons': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.config.addons', acl:'acl_manage_addons', checkForAcl:'cpAddons'},
                'cpAnnotations': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.config.annotations', acl:'acl_manage_annotations', checkForAcl:'cpAnnotations'},
                'cpCurrency': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.config.currency', acl:'acl_manage_currency', checkForAcl:'cpCurrency'},
                'cpDestinations': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.config.destinations', acl:'acl_manage_destinations', checkForAcl:'cpDestinations'},
                'cpDevices': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.config.devices', acl:'acl_manage_devices', checkForAcl:'cpDevices'},
                'cpFunctionpanel': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.config.functionpanel', acl:'acl_manage_function_panel', checkForAcl:'cpFunctionpanel'},
                'cpHotkey': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.config.hotkey', acl:'acl_manage_hotkey', checkForAcl:'cpHotkey'},
                'cpLayout': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.config.layout', acl:'acl_layout_manager', checkForAcl:'cpLayout'},
                'cpLedger': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.config.ledger', acl:'acl_manage_ledger', checkForAcl:'cpLedger'},
                'cpSysprefs': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.config.sysprefs', acl:'acl_manage_system_options', checkForAcl:'cpSysprefs'},
                'cpTableman': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.config.tableman', acl:'acl_manage_tableman', checkForAcl:'cpTableman'},

                'devReceipt2': {type:'css', method:'hidden', selector: '#devicesXUL #deviceReceipt2Box', checkForCss:'devReceipt2'},
                'devReportLabel': {type:'css', method:'hidden', selector: '#devicesXUL #report-tab', checkForCss:'devReport,devLabel'},
                'devReport': {type:'css', method:'hidden', selector: '#devicesXUL #deviceReportBox', checkForCss:'devReport'},
                'devLabel': {type:'css', method:'hidden', selector: '#devicesXUL #deviceLabelBox', checkForCss:'devLabel'},
                'devVfd2': {type:'css', method:'hidden', selector: '#devicesXUL #devVfd2Box', checkForCss:'devVfd2'},
                'devDrawer2': {type:'css', method:'hidden', selector: '#devicesXUL #cashdrawer-2-tab', checkForCss:'devDrawer2'},
                'devScale': {type:'css', method:'hidden', selector: '#devicesXUL #scale-tab', checkForCss:'devScale1,devScale2'},
                'devScale1': {type:'css', method:'hidden', selector: '#devicesXUL #devicesScale1Box', checkForCss:'devScale1'},
                'devScale2': {type:'css', method:'hidden', selector: '#devicesXUL #devicesScale2Box', checkForCss:'devScale2'},
                'devJournal': {type:'css', method:'hidden', selector: '#devicesXUL #journal-tab', checkForCss:'devJournal'},
                'attrDevicesCheckPrinter': {type:'prefs', method:'write', key:'vivipos.fec.settings.devices.limit.check', preftype:'integer'},

                'tabRegion': {type:'css', method:'hidden', selector: '#tableManXUL #tab_regions', checkForCss:'tabRegion'},
                'tabMark': {type:'css', method:'hidden', selector: '#tableManXUL #tab_marks,#selectTableXUL #markTableBtn,#selectTableXUL #unmarkTableBtn,#selectTableXUL #addmarksBtn,#selectTableXUL #clearMarksBtn', checkForCss:'tabMark'},
                'tabMinimumCharge': {type:'css', method:'hidden', selector: '#tableManXUL vbox[module="minimumCharge"]', checkForCss:'tabMinimumCharge'},
                'tabDock': {type:'css', method:'hidden', selector: '#tableManXUL #tab_options_dock', checkForCss:'tabDock'},
                'tabSplitCheck': {type:'css', method:'hidden', selector: '#order_display_panel #splitCheckBox', checkForCss:'tabSplitCheck'},
                'tabMergeCheck': {type:'css', method:'hidden', selector: '#order_display_panel #mergeCheckBox', checkForCss:'tabMergeCheck'},
                'tabTransTable': {type:'css', method:'hidden', selector: '#order_display_panel #transTableBox', checkForCss:'tabTransTable'},
                'tabBookingTable': {type:'css', method:'hidden', selector: '#selectTableXUL #bookBtn', checkForCss:'tabBookingTable'},

                'optTrainingMode': {type:'css', method:'hidden', selector: '#prefwin radio[pane="trainingSettingsPane"]', checkForCss:'optTrainingMode'},
                'optFormatSettings': {type:'css', method:'hidden', selector: '#prefwin radio[pane="formatSettingsPane"]', checkForCss:'optFormatSettings'},
                'optAddonsUpdate': {type:'css', method:'hidden', selector: '#extensionsManager #addonContextMenu, #extensionsManager #checkUpdatesAllButton', checkForCss:'optAddonsUpdate'},
                'optAddonsSDKUpdate': {type:'css', method:'hidden', selector: '#extensionsManager #checkSDKUpdateButton', checkForCss:'optAddonsSDKUpdate'},
                'optAddonsEditable': {type:'css', method:'hidden', selector: '#extensionsManager .selectedButtons, #extensionsManager #installFileButton', checkForCss:'optAddonsEditable'},
                'optAddonsExtensionsView': {type:'css', method:'hidden', selector: '#extensionsManager #extensions-view', checkForCss:'optAddonsExtensionsView'},
                'optAddonsLocalesView': {type:'css', method:'hidden', selector: '#extensionsManager #locales-view', checkForCss:'optAddonsLocalesView'},
                'optAddonsPluginsView': {type:'css', method:'hidden', selector: '#extensionsManager #plugins-view', checkForCss:'optAddonsPluginsView'}
            },

            systemsForm: {
                'cpAdminTools': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.admin_tools', acl:'acl_admin_tools', checkForAcl:'cpAdminTools'},
                'cpDatetime': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.datetime', acl:'acl_manage_date_time', checkForAcl:'cpDatetime'},
                'cpImportexport': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.importexport', acl:'acl_manage_import_export', checkForAcl:'cpImportexport'},
                'cpLocalekeyboard': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.localekeyboard', acl:'acl_manage_locale_keyboard', checkForAcl:'cpLocalekeyboard'},
                'cpLocalization': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.localization', acl:'acl_localization_editor', checkForAcl:'cpLocalization'},
                'cpNetworkSetting': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.network_setting', acl:'acl_manage_network_setting', checkForAcl:'cpNetworkSetting'},
                'cpPrinters': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.printers', acl:'acl_manage_printers', checkForAcl:'cpPrinters'},
                'cpRemoteControl': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.remote_control', acl:'acl_remote_control', checkForAcl:'cpRemoteControl'},
                'cpSyncSettings': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.sync_settings', acl:'acl_manage_sync_settings', checkForAcl:'cpSyncSettings'},
                'cpSystembackup': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.systembackup', acl:'acl_manage_backup', checkForAcl:'cpSystembackup'},
                'cpTouchCalibration': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.touch_calibration', acl:'acl_touch_settings', checkForAcl:'cpTouchCalibration'},
                'cpXterm': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.xterm', acl:'acl_xterm', checkForAcl:'cpXterm'},
                'cpJournal': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.journal', acl:'acl_manage_journal', checkForAcl:'cpJournal'},
                'cpViewSystemLog': {type:'prefs', method:'remove', key:'vivipos.fec.settings.controlpanels.system.view_system_log', acl:'acl_view_system_log', checkForAcl:'cpViewSystemLog'},

                'serviceSyncSettingsAdvTab': {type:'css', method:'hidden', selector: '#syncSettingsXUL #advanced-tab', checkForCss:'serviceSyncSettingsAdvTab'},
                'serviceSyncSettingsTab': {type:'css', method:'hidden', selector: '#syncSettingsXUL #services-tab', checkForCss:'serviceSyncSettingsSeq,serviceSyncSettingsTable,serviceSyncSettingsStock,serviceSyncSettingsNtp'},
                'serviceSyncSettingsSeq': {type:'css', method:'hidden', selector: '#syncSettingsXUL #syncSettingsSeqBox', checkForCss:'serviceSyncSettingsSeq'},
                'serviceSyncSettingsSalePeriod': {type:'css', method:'hidden', selector: '#syncSettingsXUL #syncSettingsSalePeriodBox', checkForCss:'serviceSyncSettingsSalePeriod'},
                'serviceSyncSettingsTable': {type:'css', method:'hidden', selector: '#syncSettingsXUL #syncSettingsTableBox', checkForCss:'serviceSyncSettingsTable'},
                'serviceSyncSettingsStock': {type:'css', method:'hidden', selector: '#syncSettingsXUL #syncSettingsStockBox', checkForCss:'serviceSyncSettingsStock'},
                'serviceSyncSettingsNtp': {type:'css', method:'hidden', selector: '#syncSettingsXUL #syncSettingsNtpBox', checkForCss:'serviceSyncSettingsNtp'},
                'serviceSyncSettingsIRC': {type:'css', method:'hidden', selector: '#syncSettingsXUL #syncSettingsIrcBox, #syncSettingsXUL #irc-tab', checkForCss:'serviceSyncSettingsIRC'},

                'internalDisableJournal': {type:'prefs', method:'write', key:'vivipos.fec.settings.internal.disableJournal', preftype:'boolean'}
            },
            
            reportsForm: {
                'rptAttendancerecord': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.attendancerecord', acl:'acl_report_attendancerecord', checkForAcl:'rptAttendancerecord'},
                'rptCashbyclerk': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.cashbyclerk', acl:'acl_report_cashbyclerk', checkForAcl:'rptCashbyclerk'},
                'rptCashdrawerreport': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.cashdrawerreport', acl:'acl_report_cashdrawerreport', checkForAcl:'rptCashdrawerreport'},
                'rptCashdrawersummary': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.cashdrawersummary', acl:'acl_report_cashdrawersummary', checkForAcl:'rptCashdrawersummary'},
                'rptClerksalesreport': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.clerksalesreport', acl:'acl_report_clerksalesreport', checkForAcl:'rptClerksalesreport'},
                'rptDailysalesdetail': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.dailysalesdetail', acl:'acl_report_dailysalesdetail', checkForAcl:'rptDailysalesdetail'},
                'rptDailysales': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.dailysales', acl:'acl_report_dailysales', checkForAcl:'rptDailysales'},
                'rptDailysalessummary': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.dailysalessummary', acl:'acl_report_dailysalessummary', checkForAcl:'rptDailysalessummary'},
                'rptDepartmentlist': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.departmentlist', acl:'acl_report_departmentlist', checkForAcl:'rptDepartmentlist'},
                'rptDetailedtaxreport': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.detailedtaxreport', acl:'acl_report_detailedtaxreport', checkForAcl:'rptDetailedtaxreport'},
                'rptHourlysales': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.hourlysales', acl:'acl_report_hourlysales', checkForAcl:'rptHourlysales'},
                'rptOrderannotation': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.orderannotation', acl:'acl_report_orderannotation', checkForAcl:'rptOrderannotation'},
                'rptOrderstatus': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.orderstatus', acl:'acl_report_orderstatus', checkForAcl:'rptOrderstatus'},
                'rptProductlist': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.productlist', acl:'acl_report_productlist', checkForAcl:'rptProductlist'},
                'rptProductsales': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.productsales', acl:'acl_report_productsales', checkForAcl:'rptProductsales'},
                'rptPromotionsummary': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.promotionsummary', acl:'acl_report_promotionsummary', checkForAcl:'rptPromotionsummary'},
                'rptSalessummary': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.salessummary', acl:'acl_report_salessummary', checkForAcl:'rptSalessummary'},
                'rptProductSalesReturn': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.productsalesreturn', acl:'acl_report_productsalesreturn', checkForAcl:'rptProductSalesReturn'},
                'rptStocks': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.stocks', acl:'acl_report_stocks', checkForAcl:'rptStocks'},
                'rptInventorycommitments': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.inventorycommitments', acl:'acl_report_inventorycommitments', checkForAcl:'rptInventorycommitments'},
                'rptPurchasehistory': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.purchasehistory', acl:'acl_report_purchasehistory', checkForAcl:'rptPurchasehistory'},
                'rptUserlist': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.userlist', acl:'acl_report_userlist', checkForAcl:'rptUserlist'},
                'rptYourorder': {type:'prefs', method:'remove', key:'vivipos.fec.reportpanels.yourorder', acl:'acl_report_run_yourorder,acl_report_yourorder', checkForAcl:'rptYourorder'}
            },

            functionsForm: {
                'fnAddcondiment': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.addcondiment'},
                'fnAddlinkedcondiment': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.addlinkedcondiment'},
                'fnAddmemo': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.addmemo'},
                'fnAnnotate': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.annotate', acl:'acl_view_annotations', checkForAcl:'fnAnnotate'},
                'fnCancel': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.cancel', acl:'acl_cancel_order', checkForAcl:'fnCancel'},
                'fnCash': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.cash', acl:'acl_open_cash', checkForAcl:'fnCash'},
                'fnChangeToCurrentLevel': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.changeToCurrentLevel', acl:'acl_revert_price_level', checkForAcl:'fnChangeToCurrentLevel'},
                'fnCheck': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.check', acl:'acl_register_check', checkForAcl:'fnCheck'},
                'fnCheckcopy': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.checkcopy', acl:'acl_issue_check_copy', checkForAcl:'fnCheckcopy'},
                'fnClear': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.clear'},
                'fnClockin': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.clockin'},
                'fnControlpanel': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.controlpanel', acl:'acl_open_control_panel', checkForAcl:'fnControlpanel'},
                'fnCoupon': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.coupon', acl:'acl_register_coupon', checkForAcl:'fnCoupon'},
                'fnCreditcard': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.creditcard', acl:'acl_register_credit_card', checkForAcl:'fnCreditcard'},
                'fnCurrencyConvert': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.currencyConvert', acl:'acl_register_currency_exchange', checkForAcl:'fnCurrencyConvert'},
                'fnDeptbyno': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.deptbyno'},
                'fnDiscountByAmount': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.discountByAmount', acl:'acl_register_reduction', checkForAcl:'fnDiscountByAmount'},
                'fnDiscountByPercentage': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.discountByPercentage', acl:'acl_register_discount', checkForAcl:'fnDiscountByPercentage'},
                'fnMassDiscountByPercentage': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.massDiscountByPercentage', acl:'acl_register_mass_discount', checkForAcl:'fnMassDiscountByPercentage'},
                'fnMassSurchargeByPercentage': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.massSurchargeByPercentage', acl:'acl_register_mass_surcharge', checkForAcl:'fnMassSurchargeByPercentage'},
                'fnDispatch': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.dispatch', acl:'acl_internal_access', checkForAcl:'fnDispatch'},
                'fnEnter': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.enter', acl:'acl_register_enter', checkForAcl:'fnEnter'},
                'fnGiftcard': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.giftcard', acl:'acl_register_giftcard', checkForAcl:'fnGiftcard'},
                'fnGuestNum': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.guestNum', acl:'acl_guest_no', checkForAcl:'fnGuestNum'},
                'fnHouseBon': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.houseBon', acl:'acl_register_housebon', checkForAcl:'fnHouseBon'},
                'fnItembybarcode': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.itembybarcode'},
                'fnKeypress': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.keypress', acl:'acl_send_keypress', checkForAcl:'fnKeypress'},
                'fnLedgerentry': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.ledgerentry', acl:'acl_add_ledger_entry', checkForAcl:'fnLedgerentry'},
                'fnMergeCheck': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.mergeCheck', acl:'acl_merge_check', checkForAcl:'fnMergeCheck'},
                'fnModifyitem': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.modifyitem', acl:'acl_modify_price,acl_modify_quantity', checkForAcl:'fnModifyitem'},
                'fnNewCheck': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.newCheck', acl:'acl_new_check', checkForAcl:'fnNewCheck'},
                'fnNewTable': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.newTable', acl:'acl_new_table', checkForAcl:'fnNewTable'},
                'fnOpendrawer1': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.opendrawer1', acl:'acl_open_cashdrawer_1', checkForAcl:'fnOpendrawer1'},
                'fnOpendrawer2': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.opendrawer2', acl:'acl_open_cashdrawer_2', checkForAcl:'fnOpendrawer2'},
                'fnPlusearch': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.plusearch', acl:'acl_plu_search', checkForAcl:'fnPlusearch'},
                'fnPrefinalize': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.prefinalize', acl:'acl_pre_finalize', checkForAcl:'fnPrefinalize'},
                'fnPricelevel1': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.pricelevel1', acl:'acl_set_price_level_1', checkForAcl:'fnPricelevel1'},
                'fnPricelevel2': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.pricelevel2', acl:'acl_set_price_level_2', checkForAcl:'fnPricelevel2'},
                'fnPricelevel3': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.pricelevel3', acl:'acl_set_price_level_3', checkForAcl:'fnPricelevel3'},
                'fnPricelevel4': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.pricelevel4', acl:'acl_set_price_level_4', checkForAcl:'fnPricelevel4'},
                'fnPricelevel5': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.pricelevel5', acl:'acl_set_price_level_5', checkForAcl:'fnPricelevel5'},
                'fnPricelevel6': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.pricelevel6', acl:'acl_set_price_level_6', checkForAcl:'fnPricelevel6'},
                'fnPricelevel7': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.pricelevel7', acl:'acl_set_price_level_7', checkForAcl:'fnPricelevel7'},
                'fnPricelevel8': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.pricelevel8', acl:'acl_set_price_level_8', checkForAcl:'fnPricelevel8'},
                'fnPricelevel9': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.pricelevel9', acl:'acl_set_price_level_9', checkForAcl:'fnPricelevel9'},
                'fnPricelevelshift': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.pricelevelshift', acl:'acl_change_price_level', checkForAcl:'fnPricelevelshift'},
                'fnPrintcheck': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.printcheck', acl:'acl_issue_check', checkForAcl:'fnPrintcheck'},
                'fnPrintdocument': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.printdocument', acl:'acl_issue_check', checkForAcl:'fnPrintdocument'},
                'fnPrinterDashboard': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.printerDashboard', acl:'acl_printer_dashboard', checkForAcl:'fnPrinterDashboard'},
                'fnPullqueue': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.pullqueue', acl:'acl_pull_queue', checkForAcl:'fnPullqueue'},
                'fnPushqueue': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.pushqueue', acl:'acl_queue_order', checkForAcl:'fnPushqueue'},
                'fnQuantity': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.quantity', acl:'acl_register_quantity', checkForAcl:'fnQuantity'},
                'fnQuicksignoff': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.quicksignoff'},
                'fnReboot': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.reboot'},
                'fnRecallCheck': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.recallCheck', acl:'acl_recall_check', checkForAcl:'fnRecallCheck,fnRecallTable,fnRecallOrder'},
                'fnReceipt': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.receipt', acl:'acl_issue_post_receipt', checkForAcl:'fnReceipt'},
                'fnReceiptcopy': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.receiptcopy', acl:'acl_issue_post_receipt_copy', checkForAcl:'fnReceiptcopy'},
                'fnReturn': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.return', acl:'acl_register_return', checkForAcl:'fnReturn'},
                'fnReturncartitem': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.returncartitem', acl:'acl_register_return_item', checkForAcl:'fnReturncartitem'},
                'fnScale': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.scale', acl:'acl_read_scale', checkForAcl:'fnScale'},
                'fnSetdestination': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.setdestination', acl:'acl_set_destination', checkForAcl:'fnSetdestination'},
                'fnShiftchange': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.shiftchange', acl:'acl_end_sale_period,acl_change_shift', checkForAcl:'fnShiftchange'},
                'fnShifttax': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.shifttax', acl:'acl_shift_item_tax', checkForAcl:'fnShifttax'},
                'fnShowpayment': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.showpayment'},
                'fnShutdown': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.shutdown'},
                'fnSignOff': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.signOff'},
                'fnSilentsignoff': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.silentsignoff'},
                'fnStockAdjustment': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.stockAdjustment', acl:'acl_stock_adjustment', checkForAcl:'fnStockAdjustment'},
                'fnStoreCheck': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.storeCheck', acl:'acl_store_check', checkForAcl:'fnStoreCheck'},
                'fnSubtotal': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.subtotal', acl:'acl_register_sub_total', checkForAcl:'fnSubtotal'},
                'fnSurchargeByAmount': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.surchargeByAmount', acl:'acl_register_addition', checkForAcl:'fnSurchargeByAmount'},
                'fnSurchargeByPercentage': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.surchargeByPercentage', acl:'acl_register_surcharge', checkForAcl:'fnSurchargeByPercentage'},
                'fnTagitem': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.tagitem', acl:'acl_tag_item', checkForAcl:'fnTagitem'},
                'fnTogglevirtualkeyboard': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.togglevirtualkeyboard'},
                'fnTrainingMode': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.trainingMode', acl:'acl_training_mode', checkForAcl:'fnTrainingMode'},
                'fnTransferTable': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.transferTable', acl:'acl_transfer_table', checkForAcl:'fnTransferTable'},
                'fnTraymarker': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.traymarker', acl:'acl_register_tray_marker', checkForAcl:'fnTraymarker'},
                'fnTruncatetxnrecords': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.truncatetxnrecords', acl:'acl_truncate_transaction_records', checkForAcl:'fnTruncatetxnrecords'},
                'fnVieworders': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.vieworders', acl:'acl_view_orders', checkForAcl:'fnVieworders'},
                'fnVoidItem': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.voidItem', acl:'acl_void_cart_item', checkForAcl:'fnVoidItem'},
                'fnVoidSale': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.voidSale', acl:'acl_void_transactions', checkForAcl:'fnVoidSale'},
                'fnSplitCheck': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.splitCheck', acl:'acl_split_check', checkForAcl:'fnSplitCheck,fnSplitPayment'},
                'fnSplitPayment': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.splitPayment', acl:'acl_split_check', checkForAcl:'fnSplitPayment,fnSplitCheck'},
                'fnOpenreport': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.openreport'},
                'fnScrollcart': {type:'prefs', method:'remove', key:'vivipos.fec.registry.function.programmable.scrollcart'}
            }
    };

    var __component__ = {

        name: 'FunctionSettings',

        settings: _settings,

        processPrefsSettings: function(form, data) {
            
            if (!form || !data) return ;
            this.log('form:' + form);
            let formSetting = this.settings[form];
            if (!formSetting) return;

            var buf = "";
            for (let name in data) {
                let setting = formSetting[name];
                if(!setting) continue;

                if (setting['type'] != 'prefs') continue;
                
                // prefs key.
                if (setting.method == 'remove') {
                    // remove prefs
                    buf += "remove('"+setting.key+"');\n";

                    if (setting.acl) {

                        // check acl keys
                        var removeAcl = true;
                        var checkPairs = setting.checkForAcl.split(',');

                        checkPairs.forEach(function(opt) {
                            if(typeof data[opt] == 'undefined') removeAcl=false;
                        }, this);

                        if(removeAcl) {
                            var aclPairs = setting.acl.split(',');
                            
                            aclPairs.forEach(function(acl){
                                buf += "remove('vivipos.fec.acl.roles."+acl+"');\n";
                            }, this);
                            
                        }

                    }

                }else if (setting.method == 'write') {
                    //'attrProdPriceLevelPref': {type:'prefs', method:'write', key:'vivipos.fec.settings.MaxPriceLevel', preftype:'integer'}
                    let writeData = data[name];

                    switch(setting.preftype) {

                        default:
                        case 'string':
                            buf += "write('"+setting.key + "', '" + writeData +"');\n";
                            break;

                        case 'float':
                        case 'boolean':
                        case 'integer':
                            buf += "write('"+setting.key + "', " + writeData +");\n";
                            break;
                    }
                }

            }

            return buf;
            
        },

        processCssSettings: function(form, data) {

            if (!form || !data) return ;
            this.log('form:' + form + ',,' + this.dump(data));
            let formSetting = this.settings[form];
            if (!formSetting) return;

            var buf = "";
            for (let name in data) {
                let setting = formSetting[name];
                if(!setting) continue;

                if (setting['type'] != 'css') continue;

                // hidden dom
                if (setting.method == 'hidden') {

                    // check all css disable
                    var removeCss = true;
                    var checkPairs = setting.checkForCss.split(',');

                    checkPairs.forEach(function(opt) {
                        if(typeof data[opt] == 'undefined') removeCss=false;
                    }, this);

                    if(removeCss) {

                        // remove css
                        buf += setting.selector + " {\n";
                        buf += "  display: none;\n";
                        buf += "}\n\n";

                    }

                }else {

                }

            }

            return buf;

        }
        

    };

    var FunctionSettingsComponent = window.FunctionSettingsComponent = GeckoJS.Component.extend(__component__);

})();

