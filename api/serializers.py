from datetime import datetime
from rest_framework import serializers
from .models import Users, Document
from django.core.cache import cache

class CaseInsensitiveChoiceField(serializers.ChoiceField):
    def to_internal_value(self, data):
        if data == '' and self.allow_blank:
            return ''
        
        try:
            data_str = str(data).strip().lower()
            for choice_value, choice_label in self.choices.items():
                if str(choice_value).strip().lower() == data_str:
                    return choice_value
        except (TypeError, ValueError):
            pass
            
        self.fail('invalid_choice', input=data)

class FlexibleFileField(serializers.FileField):
    def to_internal_value(self, data):
        if data is None:
            return None
            
        if isinstance(data, str):
            # JS FormData often sends explicit "null" or "undefined"
            if data.lower() in ('null', 'undefined'):
                return None
            if data.strip() == '':
                return None
            
            if data == "DELETE_PHOTO":
                return "DELETE_PHOTO"
            
            # If it's a string (URL), we treat it as "no change"
            # Return a special marker to be handled in the serializer
            return "KEEP_EXISTING"
            
        return super().to_internal_value(data)

class FlexibleDateField(serializers.DateField):
    def to_internal_value(self, value):
        if not value:
            return None

        if isinstance(value, str):
            # JS FormData often sends explicit "null" or "undefined"
            if value.lower() in ('null', 'undefined'):
                return None

            for fmt in ('%Y-%m-%d', '%d-%m-%Y', '%m-%d-%Y', '%d/%m/%Y', '%m/%d/%Y'):
                try:
                    parsed_date = datetime.strptime(value.strip(), fmt).date()
                    return parsed_date
                except ValueError:
                    pass

        return super().to_internal_value(value)

    def to_representation(self, value):
        # Model fields like submitted_date / reviewed_date are DateTimeField.
        # DRF's DateField.to_representation() asserts the value is a date-only
        # object and raises AssertionError when it gets a datetime.
        # Safely coerce datetime → date before handing off to the parent.
        if hasattr(value, 'date') and callable(value.date):
            value = value.date()
        return super().to_representation(value)


class UserSerializer(serializers.ModelSerializer):
    is_online = serializers.SerializerMethodField()
    
    # Case Insensitive Choices
    role = CaseInsensitiveChoiceField(choices=Users.ROLE_CHOICES, required=False)
    application_for_position = CaseInsensitiveChoiceField(choices=Users.APPLICATION_POSITION_CHOICES, required=False, allow_blank=True, allow_null=True)
    coc_certificate_name = CaseInsensitiveChoiceField(choices=Users.COC_CERTIFICATE_CHOICES, required=False, allow_blank=True, allow_null=True)
    marital_status = CaseInsensitiveChoiceField(choices=[('SINGLE', 'SINGLE'), ('MARRIED', 'MARRIED')], required=False, allow_blank=True, allow_null=True)
    user_status = CaseInsensitiveChoiceField(choices=[('VACATION', 'VACATION'), ('ON_SITE', 'ON_SITE'), ('MEDICAL VACATION', 'MEDICAL VACATION')], required=False, allow_blank=True, allow_null=True)

    # Flexible Dates
    date_of_birth = FlexibleDateField(required=False, allow_null=True)
    available_date = FlexibleDateField(required=False, allow_null=True)
    register_date = FlexibleDateField(required=False, allow_null=True)
    passport_issue_date = FlexibleDateField(required=False, allow_null=True)
    passport_expiry_date = FlexibleDateField(required=False, allow_null=True)
    seaman_book_issue_date = FlexibleDateField(required=False, allow_null=True)
    seaman_book_expiry_date = FlexibleDateField(required=False, allow_null=True)
    other_seaman_book_issue_date = FlexibleDateField(required=False, allow_null=True)
    other_seaman_book_expiry_date = FlexibleDateField(required=False, allow_null=True)
    coc_issue_date = FlexibleDateField(required=False, allow_null=True)
    coc_expiry_date = FlexibleDateField(required=False, allow_null=True)
    goc_issue_date = FlexibleDateField(required=False, allow_null=True)
    goc_expiry_date = FlexibleDateField(required=False, allow_null=True)
    health_issue_date = FlexibleDateField(required=False, allow_null=True)
    health_expiry_date = FlexibleDateField(required=False, allow_null=True)
    international_medical_issue_date = FlexibleDateField(required=False, allow_null=True)
    international_medical_expiry_date = FlexibleDateField(required=False, allow_null=True)
    yellow_fever_issue_date = FlexibleDateField(required=False, allow_null=True)
    yellow_fever_expiry_date = FlexibleDateField(required=False, allow_null=True)
    cholera_issue_date = FlexibleDateField(required=False, allow_null=True)
    cholera_expiry_date = FlexibleDateField(required=False, allow_null=True)
    covid_first_dose = FlexibleDateField(required=False, allow_null=True)
    covid_second_dose = FlexibleDateField(required=False, allow_null=True)
    declaration_date = FlexibleDateField(required=False, allow_null=True)
    marlins_test_issued_date = FlexibleDateField(required=False, allow_null=True)
    ces_test_issued_date = FlexibleDateField(required=False, allow_null=True)

    class Meta:
        model = Users
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.is_superuser or instance.is_staff:
            representation['role'] = 'Admin'
        return representation

    def get_is_online(self, obj):
        # Check cache for user activity
        # Key matches what we set in middleware
        return cache.get(f'online_user_{obj.id}') is not None

    def update(self, instance, validated_data):
        # TEMPORARY DEBUG: Write to a file we can inspect
        import datetime
        log_path = r'd:\photo_debug.log'
        with open(log_path, 'a') as f:
            f.write(f"\n--- {datetime.datetime.now()} ---\n")
            f.write(f"Updating user {instance.id}\n")
            f.write(f"'profile_image' in validated_data: {'profile_image' in validated_data}\n")
            if 'profile_image' in validated_data:
                val = validated_data['profile_image']
                f.write(f"profile_image value: {val}, type: {type(val)}\n")
            f.write(f"Current DB value BEFORE: {instance.profile_image.name if instance.profile_image else 'EMPTY'}\n")
            f.write(f"ALL keys in validated_data: {list(validated_data.keys())}\n")
        
        # FIREWALL: Prevent accidental deletion of profile_image if an empty value is sent!
        if 'profile_image' in validated_data and not validated_data.get('profile_image'):
            validated_data.pop('profile_image')
            with open(log_path, 'a') as f:
                f.write(f"FIREWALL ACTIVATED - removed empty profile_image\n")
            
        result = super().update(instance, validated_data)
        
        with open(log_path, 'a') as f:
            f.write(f"AFTER save, DB value: {instance.profile_image.name if instance.profile_image else 'EMPTY'}\n")
        return result


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'user', 'title', 'file', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']

