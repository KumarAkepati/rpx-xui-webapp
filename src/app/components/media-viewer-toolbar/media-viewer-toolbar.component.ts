import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToolbarButtonVisibilityService, ToolbarEventService } from '@hmcts/media-viewer';
import { Subscription } from 'rxjs';

export interface ButtonState {
  id: string;
  showOnToolbar: boolean;
}

@Component({
    selector: 'exui-media-viewer-toolbar',
    templateUrl: './media-viewer-toolbar.component.html',
    styleUrls: ['./media-viewer-toolbar.component.scss']
})

export class MediaViewerToolbarComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('zoomSelect') public zoomSelect: ElementRef;
  @ViewChild('mvToolbarMain') public mvToolbarMain: ElementRef<HTMLElement>;

  public pageNumber = 1;
  private readonly subscriptions: Subscription[] = [];
  public isDropdownMenuOpen = false;
  public dropdownMenuPositions = [
    new ConnectionPositionPair(
      {
        originX: 'end',
        originY: 'bottom'
      },
      {
        overlayX: 'end',
        overlayY: 'top'
      },
      0,
      3)
  ];
  private readonly breakWidths: number[] = [];
  private readonly toolbarButtonVisibilityStates: ButtonState[] = [];

  public constructor(
    public readonly toolbarEvents: ToolbarEventService,
    public readonly toolbarButtons: ToolbarButtonVisibilityService,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  public ngOnInit() {
    this.subscriptions.push(
      this.toolbarEvents.setCurrentPageSubject.subscribe(pageNumber => this.setCurrentPage(pageNumber)),
      this.toolbarEvents.setCurrentPageInputValueSubject.subscribe(pageNumber => this.pageNumber = pageNumber)
    );
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  public ngAfterViewInit() {
    let totalSpace = 0;

    // Get all toolbar elements
    const toolbarElements: HTMLElement[] = Array.prototype.slice.call(this.mvToolbarMain.nativeElement.children);

    // Set a flag for each element's visibility and push to array of button states
    for (const element of toolbarElements) {
      this.toolbarButtonVisibilityStates.push({ id: element.id, showOnToolbar: true } as ButtonState);
    }

    // Trigger change detection (necessary to ensure all toolbar elements are rendered fully - and have a size - at this stage)
    this.cdr.detectChanges();

    // Loop over all elements and set sum of widths for each toolbar element
    for (const element of toolbarElements) {
      // Use bounding client rectangle width for accuracy
      totalSpace += element.getBoundingClientRect().width;
      this.breakWidths.push(totalSpace);
    }

    // Call calculation method
    this.checkCalculation();
  }

  @HostListener('window:resize', ['$event'])
  public onResize() {
    // Call calculation method
    this.checkCalculation();
  }

  private checkCalculation() {
    // Get current space of main toolbar element, including the right margin (if any) to the "More options" button
    const availableSpace = this.mvToolbarMain.nativeElement.getBoundingClientRect().width +
    parseFloat(getComputedStyle(this.mvToolbarMain.nativeElement).marginRight);

    // Get space required for all elements in main toolbar element (i.e. break-width of the last visible element from breakWidth array)
    const indexOfLastVisibleElement = this.getIndexOfLastVisibleToolbarButton();
    const totalSpaceRequired = this.breakWidths[indexOfLastVisibleElement];

    // If more space is needed than is available, hide last element
    if (totalSpaceRequired > availableSpace) {
      // Mark the toolbar button as hidden in the button states array
      this.setToolbarButtonVisible(this.toolbarButtonVisibilityStates[indexOfLastVisibleElement].id, false);

      // Apply changes
      this.cdr.detectChanges();

      // Call this method to recalculate for rest of toolbar elements
      this.checkCalculation();
    } else if (this.toolbarHasHiddenButtons() && this.breakWidths[indexOfLastVisibleElement + 1] <= availableSpace) {
      // If there are some toolbar buttons marked as hidden in the button states array, AND there is room for the first of these,
      // mark the button as visible
      for (const buttonState of this.toolbarButtonVisibilityStates) {
        if (!buttonState.showOnToolbar) {
          buttonState.showOnToolbar = true;
          break;
        }
      }

      // Call this method to recalculate for rest of toolbar elements
      this.checkCalculation();
    }
  }

  public isToolbarButtonVisible(buttonId: string): boolean {
    for (const buttonState of this.toolbarButtonVisibilityStates) {
      if (buttonState.id === buttonId) {
        return buttonState.showOnToolbar;
      }
    }
  }

  private setToolbarButtonVisible(buttonId: string, visible: boolean) {
    for (const buttonState of this.toolbarButtonVisibilityStates) {
      if (buttonState.id === buttonId) {
        buttonState.showOnToolbar = visible;
      }
    }
  }

  public toolbarHasHiddenButtons(): boolean {
    return this.toolbarButtonVisibilityStates.some(buttonState => buttonState.showOnToolbar === false);
  }

  private getIndexOfLastVisibleToolbarButton(): number {
    for (let i = this.toolbarButtonVisibilityStates.length - 1; i >= 0; i--) {
      if (this.toolbarButtonVisibilityStates[i].showOnToolbar) {
        return i;
      }
    }
  }

  // Handler onClick Event of the Highlight Mode Button
  public onClickHighlightToggle() {
    // Emit an event that HighlightMode has been enabled/disabled
    this.toolbarEvents.toggleHighlightMode();
  }
  // Handler onClick Event of the Draw Mode Button
  public onClickDrawToggle() {
    // Emit an event that HighlightMode has been enabled/disabled
    this.toolbarEvents.toggleDrawMode();
  }

  public toggleSideBar() {
    this.toolbarButtons.showSidebar = !this.toolbarButtons.showSidebar;
  }

  public toggleSearchBar() {
    this.toolbarButtons.showSearchBar = !this.toolbarButtons.showSearchBar;
  }

  public increasePageNumber() {
    this.toolbarEvents.incrementPage(1);
  }

  public decreasePageNumber() {
    this.toolbarEvents.incrementPage(-1);
  }

  public onPageNumberInputChange(pageNumber: string) {
    this.toolbarEvents.setPage(Number.parseInt(pageNumber, 0));
  }

  private setCurrentPage(pageNumber: number) {
    this.pageNumber = pageNumber;
  }

  public rotate(rotation: number) {
    this.toolbarEvents.rotate(rotation);
  }

  public printFile() {
    this.toolbarEvents.print();
  }

  public downloadFile() {
    this.toolbarEvents.download();
  }

  public zoom(zoomFactor: string) {
    this.toolbarEvents.zoom(+zoomFactor);
  }

  public stepZoom(zoomFactor: number) {
    this.toolbarEvents.stepZoom(zoomFactor);
    this.zoomSelect.nativeElement.selected = 'selected';
  }

  public toggleCommentsPanel() {
    // Not available in media-viewer Version 2.3.10 but currently unable to upgrade due to build failure from Version 2.3.11 onwards
    // (see change made in media-viewer package.json for Version 2.3.11, regarding ngx-chips)
    // this.toolbarEvents.toggleCommentsPanel(!this.toolbarEvents.commentsPanelVisible.getValue());
  }

  public togglePresentBar() {
    // TODO
  }

  public toggleRedactBar() {
    this.toolbarEvents.toggleRedactionMode();
  }

  public toggleGrabNDrag() {
    this.toolbarEvents.toggleGrabNDrag();
  }
}
