import { asLiteral } from '@angular/compiler/src/render3/view/util';
import { 
  Component, 
  OnInit,
  OnDestroy,
  AfterViewInit, 
  ElementRef,
  ViewChild,
  Renderer2,
  ViewEncapsulation,
  AfterContentInit,
  AfterContentChecked, 
  Input} from '@angular/core';

@Component({
  selector: 'tgt-uxlib-table',
  template: `<div #t_uxwrapper><ng-content></ng-content><div #t_uxsizemaintainer class='sizemaintainer'></div></div>`,
  styleUrls: [
    './tgt-uxlib.component.css'
  ],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class TgtUxlibComponent implements
 OnInit,
 AfterViewInit,
 OnDestroy,
 AfterContentInit,
 AfterContentChecked {

  @ViewChild('t_uxwrapper') private somecontent:ElementRef | undefined;
  @ViewChild('t_uxsizemaintainer') private sizemaintainer:ElementRef | undefined;

  private trackedTable:any = null;
  private minColumnWidth = 10;
  private handleHeaders:any[] = [];

  /** 
  * Tracks when the table is actually rendered.  Necessary because we cannot guarantee the parent
  * of this component is showing/hiding the table. Depending on how it's hidden, it may or may 
  * not exist in the DOM. If your parent component needs to re-render a table, set this to false
  * prior to that operation.
  */
  private isInit:boolean = false;
  @Input() public isRendered = false;
  @Input('defer') public defer = false;

  constructor(private r2:Renderer2) { }

  ngAfterContentChecked(): void {
    // Why are we doing it this way?
    // Because we cannot guarantee the content exist
    // until the parent displays it.  This can
    // happen at any time if the display of the table
    // is dynamic.
    if(!this.isRendered && !this.defer) {
      this.init();
    }
  }
  
  ngAfterContentInit(): void {
    //this.generateTableUI();
    //this.registerHandleEvents();
  }

  ngOnDestroy(): void {
    this.unRegisterHandleEvents();
    this.isRendered = false;
  }

  ngAfterViewInit(): void {
    // We can't initialize the table updates here
    // because the table may not be showing.       
  }

  init(): void {
    if(!this.isInit) {
      this.generateTableUI();
      this.registerHandleEvents();
      this.isInit = true;
    }
  }

  generateTableUI(): void {
    if(this.somecontent !== undefined) {
      let sizer = this.sizemaintainer.nativeElement;
      let wrap = this.somecontent.nativeElement;
      let tables = wrap.getElementsByTagName('table');

      if(tables.length==0) {
        // Waiting for table to exist....
        return;
      }

      let table = tables[0];
      this.trackedTable = table;
      let thead = table.firstChild;
      this.r2.addClass(table, 'resizetable');

      let tabletop = table.offsetTop;
      let tableHeight = table.offsetHeight;
      let tableheaders = thead.getElementsByTagName('th');

      if(tableheaders.length < 1) {
        throw "Cannot create component without table headers!";
      }


      // We are generating the handles here.
      // Store each column's initial width, because
      // we zero out the table width after this in
      // order to enable dynamic table widths.
      // If we just zero out the table, the columns will
      // also zero out. This will let the table grow properly.
      let totalwidths=0
      for(let th of tableheaders) {
        // Generate a handle per each column
        let isStatic = th.getAttribute('isStaticWidth');

        let th_left = th.offsetLeft;
        let th_width = th.offsetWidth;
        let th_right = th_left + th_width;
        totalwidths+=th_width;

        let handle = this.r2.createElement('div');
        this.r2.addClass(handle, 'handle');
        this.r2.appendChild(wrap, handle);
        let handlePos = th_right - handle.offsetWidth/2;
        this.r2.setStyle(handle, 'left', handlePos.toString()+'px');
        this.r2.setStyle(handle, 'top', tabletop.toString()+'px');
        this.r2.setStyle(handle, 'height', tableHeight.toString()+'px');
        if(isStatic) {
          this.r2.setStyle(handle, 'display', 'none');
        }
        let handleHeader = {
          handle: handle,
          th: th,
          mousedownHandler: null,
          width: th_width
        }
        this.handleHeaders.push(handleHeader);        
      }
      //console.log(`totalwidth: ${totalwidths}`);
      //this.r2.addClass(table, 'resizetable');

      this.r2.setStyle(table, 'width', "0px");
      for(let handleHeader of this.handleHeaders) {
        let th = handleHeader.th;
        this.r2.setStyle(th, 'width', (handleHeader.width).toString()+"px");
      }

      this.refreshHandles();

      this.isRendered = true;
    }
  }

  registerHandleEvents(): void {
    let that = this;
    let table = this.somecontent ? this.somecontent.nativeElement.getElementsByTagName('table')[0] : null;

    for(let handleHeader of this.handleHeaders) {
      let th = handleHeader.th;
      let allstyles = window.getComputedStyle(th);
      let leftpadding = parseInt(allstyles.paddingLeft);
      let rightpadding = parseInt(allstyles.paddingRight);
      //let borderLeft = parseInt(allstyles.borderLeftWidth);
      let borderRight = parseInt(allstyles.borderRightWidth);
      let handle = handleHeader.handle;
      let th_width = th.offsetWidth;

      let xdown = 0;
      let xnew = 0;

      // MOUSE DOWN HANDLER
      handleHeader.mousedownHandler = function (event:any) {
        // This is here to maintain the current scroll width. When you size down a column, this
        // of course also sizes down the table which reduces the scrollWidth of the parent "scrollable"
        // container. If you size a column down while also scrolled to the right, the mouse will not properly
        // track the column since the container scroll width changes. This prevents that.
        // "sizer" is set to the width of the anscestor that has a scrollWidth if one is found.
        // Unset the width on mouse up.
        let sizer = that.sizemaintainer.nativeElement;
        let parentcontainer = that.somecontent.nativeElement.getRootNode().host;
        while(parentcontainer!=null) {
          //console.log(parentcontainer.scrollWidth);
          if(parentcontainer.scrollWidth > 0) {
            that.r2.setStyle(sizer, 'width', parentcontainer.scrollWidth.toString()+"px");
            break;
          }
          parentcontainer = parentcontainer.parentNode;
        }
        that.r2.addClass(document.body, 'unselectable');
        xdown = event.pageX;
        th_width = th.offsetWidth;
        document.addEventListener('mousemove', documentMouseMoveHandler);
        document.addEventListener('mouseup', documentMouseUpHandler);
      }

      handle.addEventListener('mousedown', handleHeader.mousedownHandler);

      // DOCUMENT MOUSE MOVE HANDLER
      let documentMouseMoveHandler = function (event:any) {
        xnew = event.pageX;
        let xdiff = xnew - xdown;
        if(th_width+xdiff > that.minColumnWidth) {
          that.r2.setStyle(th, 'width', (th_width+xdiff-leftpadding-rightpadding-borderRight).toString()+"px");
        }
        that.refreshHandles();
      }
      
      // DOCUMENT MOUSE UP HANDLER
      let documentMouseUpHandler = function(event:any) {
        // unset sizer width first.
        let sizer = that.sizemaintainer.nativeElement;
        that.r2.setStyle(sizer, 'width', "0px");

        that.r2.removeClass(document.body, 'unselectable');
        that.refreshHandles();
        document.removeEventListener('mousemove', documentMouseMoveHandler);
        document.removeEventListener('mouseup', documentMouseUpHandler);
      }
    } 
  }

  unRegisterHandleEvents(): void {
    for(let handleHeader of this.handleHeaders) {
      let handle = handleHeader.handle;
      handle.removeEventListener('mousedown', handleHeader.mousedownHandler);
    } 
  }

  refreshHandles(): void {
    if(this.somecontent !== undefined) {
      //let wrap = this.somecontent.nativeElement;
      //let tables = wrap.getElementsByTagName('table');
      //let table = tables[0];
      //let tableheaders = table.getElementsByTagName('th');
      let table = this.trackedTable;
      let tabletop = table.offsetTop;
      let tableHeight = table.offsetHeight;
      for(let handleHeader of this.handleHeaders) {
        let th = handleHeader.th;
        let allstyles = window.getComputedStyle(th);
        //let leftpadding = parseInt(allstyles.paddingLeft);
        //let rightpadding = parseInt(allstyles.paddingRight);
        //let borderLeft = parseInt(allstyles.borderLeftWidth);
        let borderRight = parseInt(allstyles.borderRightWidth);

        let handle = handleHeader.handle;
        let th_left = th.offsetLeft;
        let th_width = th.offsetWidth;
        let th_right = th_left + th_width;
        
        let handlePos = th_right - handle.offsetWidth/2 + borderRight/2;
        this.r2.setStyle(handle, 'left', handlePos.toString()+'px');
        this.r2.setStyle(handle, 'top', tabletop.toString()+'px');
        this.r2.setStyle(handle, 'height', tableHeight.toString()+'px');
      }      
    }
  }

  ngOnInit(): void {
  }
}
