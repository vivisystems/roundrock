<div class="paper">
    <img src="chrome://viviecr/content/skin/images/logo.png" />
    <br />
<div class="PageTitle">
		${head.title}
</div>
<div class="ReportDate">
    <table width="100%">
    	<tr>
    		<td>
    			<table>
		        <tr>
		            <td>
		            	Printed : 
		            </td>
		            <td>
		            	${printedtime}
		            </td>
		        </tr>
		        <tr>
		            <td>
		            Machine Id : 
		            </td>
		            <td>
		            ${head.machine_id}
		            </td>
		        </tr>
		    </table>
    		</td>
    		<td align="right">
			    <table>
			        <tr>
			            <td>
			            Start : 
			            </td>
			            <td>
			            ${head.start_date}
			            </td>
			        </tr>
			        <!-- html:tr>
			            <td>
			            Department:
			            </td>
			            <td>
			            ${head.department}
			            </td>
			        </tr -->
			        <tr>
			            <td>
			            End : 
			            </td>
			            <td>
			            ${head.end_date}
			            </td>
			        </tr>
			    </table>			
    		</td>
    	</tr>
    </table>
    
</div>

    <table id="body-table">
        <thead>
            <tr>
                <th style="text-align: center;">No</th>
                <th style="text-align: left;">Name</th>
                <th style="text-align: right;">Avg. Price</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
{for item in body}
            <tr>
                <td style="text-align: center;">${item.product_no}</td>
                <td style="text-align: left;">${item.product_name}</td>
                <td>${item.avg_price}</td>
                <td>${item.qty}</td>
                <td>${item.total}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3">Summary:</td>
                <td>${foot.qty}</td>
                <td>${foot.summary}</td>
            </tr>
        </tfoot>
    </table>
    <br />
    
</div>
<br />
