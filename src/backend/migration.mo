import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldProduct = {
    id : Text;
    artistId : Principal;
    title : Text;
    description : Text;
    price : Nat;
    productImages : [Storage.ExternalBlob];
  };

  type OldActor = {
    products : Map.Map<Text, OldProduct>;
  };

  type NewProduct = {
    id : Text;
    artistId : Principal;
    title : Text;
    description : Text;
    price : Nat;
    productImages : [Storage.ExternalBlob];
    subcategory : Text;
  };

  type NewActor = {
    products : Map.Map<Text, NewProduct>;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map<Text, OldProduct, NewProduct>(
      func(_id, oldProduct) {
        { oldProduct with subcategory = "" };
      }
    );
    { products = newProducts };
  };
};
