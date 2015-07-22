describe('NotesCollectionView', function(){
  context('when a list item is added to a note', function(){
    var collection = $el = view = null;

    //setup the view
    beforeEach(function(){
      collection = new NotesCollection();
      collection.createCallCount = 0;
      collection.create = function(){
        this.createCallCount++;
      };
      $el = $('<div />');
      view = new NotesCollectionView({
        collection: collection,
        el: $el
      });
      view.render();
    });

    //add an input & click button
    beforeEach(function(){
      view.$('#notesInput').val('List Item');
      view.$('#tskBtn').click();
    })

    //teardown the view
    afterEach(function(){
      $el.remove();
    });

    it('resets input field to nothing', function(){
      chai.expect(view.$('#notesInput').val()).to.equal('');
    });
    it('adds new note to the collection', function(){
      chai.expect(view.collection.createCallCount).to.equal(1);
    });
  })

  context('when a list item is clicked', function(){
    it('changes the status');
  })

  describe('when the "clear" button is clicked', function(){
    it('removes "superDone" notes');
  })
})
