<div class="paper" style="overflow:auto;" >
<!-- div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" -->

        <table id="body-table">
            <caption>${head.title}</caption>
            <thead>
                <tr>
                    <th style="text-align: left;">No</th>
                    <th style="text-align: left;">Name</th>
                </tr>
            </thead>
            <tbody>
{for category in body}
                <tr>
                    <td style="text-align: left;">${category.no}</td>
                    <td style="text-align: left;">${category.name}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                <td colspan="2"></td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
