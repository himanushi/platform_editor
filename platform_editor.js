var data = init_data();

// データ初期化
function init_data() {
  var
    m = moment().startOf( 'month' ),
    end_date = m.daysInMonth();

  return create_data( m, end_date );
}

// Data作成
function create_data( m, end_date ) {
  var
    i = 0,
    data_list = [];

  for ( ; i < end_date; i++ ) {
    d = [];
    d.push( m.format( 'MM/DD (ddd)' ) );
    m.add( 1, 'day' );
    data_list.push( d );
  }

  return data_list;
}

// 年月が変更された時にグリッドを変更する
function change_date() {
  var m = moment();
  m.set( 'year', $( '#year' ).val() );
  m.set( 'month', $( '#month' ).val() );

  data  = create_data( m.startOf( 'month' ), m.startOf( 'month' ).daysInMonth() );

  grid.loadData( data );
}

var platform_editor = {};
( function() {

  "use strict";

  var platform_result = document.getElementById( 'platform_result' );

  // プラットフォームのjQuery実行内容出力結果
  platform_editor.setText = function() {

    var result = '';

    // 一行づつ作成する
    $.each( data, function( i, value ) {
      var date = moment( $( '#year' ).val() + '/' + value[ 0 ], 'YYYY/MM/DD (dd)' );

      // 作業時間と休憩時間を生成
      $.each( [ 'start_time', 'end_time', 'relax_time' ], function( j, category ) {
        if ( value[ j + 1 ] == null ) return;
        result +=
          "$('#" + date.format( 'YYYYMMDD' ) + category + "').val('" + value[ j + 1 ] + "').trigger('focusout');\n";
      });

      // 作業内容生成
      if ( value[ 4 ] != null ) {
        result += "$('#DailyReport" + date.format( 'YYYYMMDD' ) + "WorkContent').val('" + value[ 4 ] + "');\n";
      }
    });

    platform_result.innerHTML = result;
  };

  // コピペを簡単にする
  $( '#platform_result' ).click( function() {

    var
      range = document.createRange(),
      selection = window.getSelection();

    range.selectNodeContents( this );
    selection.removeAllRanges();
    selection.addRange( range );

  });

})();

var grid = {};
( function() {

  "use strict";

  var
    container = document.getElementById( 'grid' ),

    year_ele = document.getElementById( 'year' ),

    month_ele = document.getElementById( 'month' ),

    // 時間のプルダウンリスト
    time_list = function () {
      var
        m = moment().startOf( 'day' ),
        i = 0,
        end_time_count = 96,
        add_minute = 15,
        list = [];

      for ( ; i < end_time_count; i++ ) {
        list.push( m.format( 'HH:mm' ) );
        m.add( add_minute, 'minute' );
      }

      return list;
    };

  // グリッドのインスタンス生成
  grid = new Handsontable( container, {

    // バインドされる値
    data: data,

    // ヘッダー
    colHeaders: ['　日付　', '　開始　', '　終了　', '　休憩　', '　作業内容　'],

    // 行ごとの状態
    columns: [
      { readOnly: true },
      { type: 'dropdown', source: time_list() },
      { type: 'dropdown', source: time_list() },
      { type: 'dropdown', source: time_list() },
      {}
    ],

    // グリッドの更新後に実行されるやつ
    afterRender: function ( changes, source ) {
      platform_editor.setText();
    },

    // セルの大きさ変更禁止
    afterCreateRow: function( index, amount ){
      data.splice( index, amount )
    }

  });

  ( function() {
    $( '#year' ).val( moment().get( 'year' ) ).change( function () {
      change_date();
    });
    $( '#month' ).val( moment().get( 'month' ) ).change( function () {
      change_date();
    });
  })();

})();