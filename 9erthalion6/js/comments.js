$(document).ready(function(){
	var smileCode={19:'[evil]',21:':))',23:'/:)',48:'<):)',100:':)]',1:':)',20:':((',2:':(',5:';;)',3:';)',6:'[descend]',4:':D',42:':-SS',18:'#:-S',39:':-?',47:'>:P',10:':P',37:'(:|',22:':|',7:':-/',11:':-*',12:'=((',102:'~X(',16:'B-)',17:':-S',24:'=))',25:'O:-)',26:':-B',27:'=;',29:'8-|',30:'L-)',31:':-&',32:':-$',33:'[-(',34:':O)',35:'8-}',36:'<:-P',8:':x',38:'=P~',40:'#-o',41:'=D>',43:'@-)',44:':^o',45:':-w',46:':-<',13:':-O',15:'[he]',101:':-c',14:'X(',103:':-h',105:'8->'};
	$("input[type=submit]").button();
	$("#comments").emotions();//{handle: 'etoggle'});
	for(var i=1;i<29;i++)
	{
		$("#smiles").append("<p><img class='emotions' src='emotions/"+i+".gif'/></p>");
	}
	$(".emotions").each(function(i){
		$(this).click(function(){
			$("#textField").val($("#textField").val()+smileCode[i+1]);
			});
		});
});
