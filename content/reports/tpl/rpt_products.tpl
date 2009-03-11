<div class="paper">
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<p align="left">${head.store.name}</p>
<p align="left">${head.store.branch}</p>
<p align="left">${head.store.telephone1}</p>
<p align="left">Clerk: ${head.clerk_displayname}</p>
<p align="right">Printed Time: ${foot.gen_time}</p>
<!--div id="docbody" class="paper"-->
{for category in body}
        <table id="body-table">
            <caption>${category.no} - ${category.name}</caption>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Name</th>
                    <th>Barcode</th>
                    <th>Tax</th>
                    <th>Stock</th>
                    <th>Safe_Stock</th>
                </tr>
            </thead>
            <tbody>
{for plu in category.plu}
                <tr>
                    <td style="text-align: left;">${plu.no}</td>
                    <td style="text-align: left;">${plu.name}</td>
                    <td style="text-align: left;">${plu.barcode}</td>
                    <td style="text-align: left;">${plu.rate}</td>
                    <td>${plu.stock}</td>
                    <td>${plu.min_stock}</td>
                </tr>
                <tr>
                    <td></td>
                    <td colspan="5">
                        <table>
                            <tr>
                                <td></td>
                                <td>Level1{if plu.level_enable1}*{/if}</td>
                                <td>Level2{if plu.level_enable2}*{/if}</td>
                                <td>Level3{if plu.level_enable3}*{/if}</td>
                                <td>Level4{if plu.level_enable4}*{/if}</td>
                                <td>Level5{if plu.level_enable5}*{/if}</td>
                                <td>Level6{if plu.level_enable6}*{/if}</td>
                                <td>Level7{if plu.level_enable7}*{/if}</td>
                                <td>Level8{if plu.level_enable8}*{/if}</td>
                                <td>Level9{if plu.level_enable9}*{/if}</td>
                            </tr>
                            <tr>
                                <td>Price:</td>
                                <td>${plu.price_level1|viviFormatPrices:true}</td>
                                <td>${plu.price_level2|viviFormatPrices:true}</td>
                                <td>${plu.price_level3|viviFormatPrices:true}</td>
                                <td>${plu.price_level4|viviFormatPrices:true}</td>
                                <td>${plu.price_level5|viviFormatPrices:true}</td>
                                <td>${plu.price_level6|viviFormatPrices:true}</td>
                                <td>${plu.price_level7|viviFormatPrices:true}</td>
                                <td>${plu.price_level8|viviFormatPrices:true}</td>
                                <td>${plu.price_level9|viviFormatPrices:true}</td>
                            </tr>
                            <tr>
                                <td>Halo:</td>
                                <td>${plu.price_halo1|viviFormatPrices:true}</td>
                                <td>${plu.price_halo1|viviFormatPrices:true}</td>
                                <td>${plu.price_halo1|viviFormatPrices:true}</td>
                                <td>${plu.price_halo4|viviFormatPrices:true}</td>
                                <td>${plu.price_halo5|viviFormatPrices:true}</td>
                                <td>${plu.price_halo6|viviFormatPrices:true}</td>
                                <td>${plu.price_halo7|viviFormatPrices:true}</td>
                                <td>${plu.price_halo8|viviFormatPrices:true}</td>
                                <td>${plu.price_halo9|viviFormatPrices:true}</td>
                            </tr>
                            <tr>
                                <td>Lalo:</td>
                                <td>${plu.price_lalo1|viviFormatPrices:true}</td>
                                <td>${plu.price_lalo1|viviFormatPrices:true}</td>
                                <td>${plu.price_lalo1|viviFormatPrices:true}</td>
                                <td>${plu.price_lalo4|viviFormatPrices:true}</td>
                                <td>${plu.price_lalo5|viviFormatPrices:true}</td>
                                <td>${plu.price_lalo6|viviFormatPrices:true}</td>
                                <td>${plu.price_lalo7|viviFormatPrices:true}</td>
                                <td>${plu.price_lalo8|viviFormatPrices:true}</td>
                                <td>${plu.price_lalo9|viviFormatPrices:true}</td>
                            </tr>
                            <tr>
                                <td colspan="10">
                                    <table>
                                        <tr>
                                            <td>Maintain_Stock: ${plu.auto_maintain_stock}</td>
                                            <td>Return_Stock: ${plu.return_stock}</td>
                                            <td>Single: ${plu.single}</td>
                                            <td>Age_Verification: ${plu.age_verification}</td>
                                            <td>Visible: ${plu.visible}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>

                </tr>

{/for}
            </tbody>
            <tfoot>
                <tr>
                <td colspan="4"></td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
