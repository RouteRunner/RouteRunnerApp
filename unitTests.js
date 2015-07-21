describe('NotesCollectionView', function(){
  describe('when a note is clicked', function(){
    var collection = $el = view = null;

    //setup the view
    beforeEach(function(){
      collection = new NotesCollection();
      collection.createCallCount = 0;
      collection.create = function(){
        this.createCallCount++;
      }
      $el = $('<div />');
      view = new NotesCollectionView({
        collection: collection,
        $el: el
      });
      view.render();
    });

    //add an input & click button
    beforeEach(function(){
      view.$('#notesInput').val('Some Test Input');
      view.$('#tskBtn').click();
    })

    //teardown the view
    afterEach(function(){
      $el.remove();
    });

    it('updates CSS');
    it('resets input', function(){
      expect(view.$('#notesInput').val()).to.eq('');
    });
    it('adds new note to the collection', function(){
      expect(view.collection.createCallCount).to.eq(1);
    });
  })
  describe('when the "clear" button is clicked', function(){
    it('removes "superDone" notes');
  })
})
