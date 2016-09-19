(function(angular, 	undefined) {
	'use strict';
	console.log('aaaaa');
	function init() {
		var xxx = new XMLHttpRequest();
		var mdb = 'assets/datasource/mydb.mdb';
		/*
		var cn = new ActiveXObject( "ADODB.Connection" );
		var rs = new ActiveXObject( "ADODB.Recordset" );
		var conn = 'Provider=Microsoft.Jet.OLEDB.4.0; Data Source=' + mdb + '; Persist Security Info=False;';
		var sql = 'select  * from dimactions';

		rs.CursorLocation = 3;
		rs.CursorType = 1;
		rs.LockType = 3;
		cn.connectionString = conn;
		cn.open();
		rs.Open( sql, cn );
		rs.MoveFirst();

		console.log(rs.RecordCount);

		rs.close();
		cn.close();
		*/
		console.log(xxx);
	}

	init();

	angular.module('Demo',[]);

}(window.angular));