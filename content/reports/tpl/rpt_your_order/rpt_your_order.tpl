<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<p class="heading_p">${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}</p>
		<p class="heading_p">${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}</p>
		<p class="caption">${head.title}</p>
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" align="right">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p>
		<p class="caption">${head.start_time} - ${head.end_time}</p>
	</div>
	
        <table id="body-table">
            <thead>
                <tr>
{for field in fields}
                    <th style="text-align: center;">${_( '(rpt)' + field.name )}</th>
{/for}
                </tr>
            </thead>
            <tbody>
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
                <tr id="${detail.id}">
{for field in fields}
{if field.datatype == "time"}
                    <td style="text-align: center;">${detail[ field.value ]|unixTimeToString}</td>
{elseif field.datatype == "date"}
                    <td style="text-align: center;">${detail[ field.value ]|unixTimeToLocale:'date'}</td>
{elseif field.datatype == "dollar"}
                    <td style="text-align: right;">${detail[ field.value ]|default:0|viviFormatPrices:true}</td>
{elseif field.datatype == "number"}
                    <td style="text-align: right;">${detail[ field.value ]}</td>
{elseif field.datatype == "counter"}
                    <td style="text-align: right;">${detail[ field.value ]|default:0}</td>
{else}
                    <td style="text-align: center;">${detail[ field.value ]}</td>
{/if}
{/for}
                </tr>
{/for}
            </tbody>
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
            <tfoot>
                <tr>
                    <td colspan="${fields.length}">
                        <span style="float: left;">${_( '(rpt)Records Found' ) }: ${body.length|default:0|format:0}</span>
                        <span style="float: right;">${_( '(rpt)Summary' ) + ':'}</span>
                    </td>
                </tr>
                <tr>
{for field in fields}
{if field.datatype == "time"}
                    <td style="text-align: center;">${foot.foot_datas[ field.value ]|unixTimeToString}</td>
{elseif field.datatype == "date"}
                    <td style="text-align: center;">${foot.foot_datas[ field.value ]|unixTimeToLocale:'date'}</td>
{elseif field.datatype == "dollar"}
                    <td style="text-align: right;">${foot.foot_datas[ field.value ]|default:0|viviFormatPrices:true}</td>
{elseif field.datatype == "number"}
                    <td style="text-align: right;">${foot.foot_datas[ field.value ]}</td>
{elseif field.datatype == "counter"}
                    <td style="text-align: right;">${foot.foot_datas[ field.value ]|default:0}</td>
{else}
                    <td style="text-align: center;">${foot.foot_datas[ field.value ]}</td>
{/if}
{/for}
                </tr>
            </tfoot>
        </table>
        </br>
</div>
<!--/div -->
