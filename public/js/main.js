function addincomes(product_id, amounts, incomes_order_id) {
    if(amounts > 0) {
        $.ajax({
            type: 'POST',
            url: '/add/incomes',
            data: { 
                'product_id': product_id,
                'amounts': amounts,
                'incomes_order_id': incomes_order_id
            },
            success: () => {
                $("#incomes_contents").load(`/get/incomes/pages/1`);
                $("#ordered_incomes_contents").load('/get/incomes/orders/pages/1');
                $("#stocks_contents").load(`/get/stocks`);
                $("#incomes_product_id").val('');
                $("#incomes_amount").val('');
                $("#incomes_order_id").val(parseInt(incomes_order_id));
            }
        });
    }
}

function addoutcomes(title, amounts) {
    if(amounts > 0) {
        $.ajax({
            type: 'POST',
            url: '/add/outcomes',
            data: { 
                'title': title,
                'amounts': amounts
            },
            success: () => {
                $("#outcomes_contents").load(`/get/outcomes/pages/1`);
                $("#outcomes_title").val('');
                $("#outcomes_amount").val('');
            }
        });
    }
}


function restocks(product_id, amounts, totals) {
    if(amounts > 0 && totals > 0) {
        $.ajax({
            type: 'POST',
            url: '/restocks',
            data: { 
                'product_id': product_id,
                'amounts': amounts,
                'totals': totals
            },
            success: () => {
                $("#outcomes_contents").load(`/get/outcomes/pages/1`);
                $("#stocks_contents").load(`/get/stocks`);
                $("#restocks_product_id").val('');
                $("#restocks_totals").val('');
                $("#restocks_amounts").val('');
            }
        });
    }
}

function get_current_incomes_order_id() {
    $.ajax({
        url: "/get/incomes/current_order_id",
        type: 'GET',
        cache: false,
        success: (result) => {
            if (result) {
                current_id = result.current_id
                $("#incomes_order_id").val(current_id);
            }
        },
    })
}